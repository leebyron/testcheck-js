(require-macros '[macros :refer [defexport defproto function? invariant]])
(require
  '[clojure.test.check :as tc]
  '[clojure.test.check.generators :as gen]
  '[clojure.test.check.properties :as prop]
  '[clojure.set :refer [rename-keys]]
  '[clojure.string :refer [split join]]
  '[promesa-check.core :as pc]
  '[promesa.core :as p])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Internal Helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn- to-object
  [from-seq]
  (let [obj (js-obj)]
    (doseq [[k v] from-seq] (aset obj k v))
    obj))

(defn- js-substring
  [[ string from to ]]
  (.substring string from to))

(defn- js-not-empty
  [x]
  (cond
    (coercive-not x)
    false

    (number? (.-length x))
    (> (.-length x) 0)

    (identical? (.-constructor x) js/Object)
    (> (.-length (js/Object.keys x)) 0)

    :else true))

; To determine "distinctness" clj uses a Set. The set's key-fn needs to
; translate JS objects into something clj can use to determine distinctiveness.
(defn- js-key-fn
  [x]
  (cond
    (identical? js/undefined x)
    :undef

    (identical? nil x)
    :null

    (not (identical? x x))
    :NaN

    (or ^boolean (js/Array.isArray x) (identical? (.-constructor x) js/Object))
    (js->clj x)

    :else x))

; For properties that only use assertions, forgetting to "return true" results
; in failing tests, if a function results in the value "undefined", then
; consider it a passing result.
(defn- undefined-passes
  [f]
  (fn []
    (let [result (.apply f nil (js-arguments))]
      (if (identical? js/undefined result) true result))))


;; Deprecation

(def warned-map #js{})
(defn- deprecated!
  [msg]
  (when-not ^boolean (aget warned-map msg)
    (aset warned-map msg true)
    (js/console.warn (str
      "DEPRECATED: " msg "\n"
      (get (split (aget (js/Error.) "stack") #"\n") 3)))))


;; Intermediate generators

(def gen-primitive (gen/frequency [
  [1 (gen/return js/undefined)]
  [2 (gen/return nil)]
  [4 gen/boolean]
  [6 gen/double]
  [20 gen/int]
  [20 gen/string]]))

(defn- gen-array
  [val-gen]
  (gen/fmap to-array (gen/vector val-gen)))

(defn- gen-object
  [val-gen]
  (gen/fmap to-object (gen/map (gen/not-empty gen/string-alphanumeric) val-gen)))

(defn- gen-array-or-object
  [val-gen]
  (gen/one-of [(gen-array val-gen) (gen-object val-gen)]))

(defn- gen-object-args
  [args]
  { :num-elements (and ^boolean args (aget args "size"))
    :min-elements (and ^boolean args (aget args "minSize"))
    :max-elements (and ^boolean args (aget args "maxSize")) })

(declare ->gen)
(defn- gen-record
  [obj]
  (let [ks (js-keys obj)
        vs (array)]
    (doseq [k ks] (.push vs (->gen (aget obj k))))
    (gen/fmap
      (partial zipmap ks)
      (apply gen/tuple vs))))

(def gen-json-primitive (gen/frequency [
  [1 (gen/return nil)]
  [2 gen/boolean]
  [3 (gen/double* {:infinite? false, :NaN? false})]
  [10 gen/int]
  [10 gen/string]]))

(def gen-json-value (gen/recursive-gen gen-array-or-object gen-json-primitive))


;; Converting between Generator and gen/generator

(declare Generator)

; Converts a Generator into a gen/generator
(defn- ->gen
  [x]
  (assert (not ^boolean (gen/generator? x)))
  (if (and ^boolean x (exists? (aget x "__clj_gen")))
    (aget x "__clj_gen")
    (gen/return x)))

; Converts a function which accepts a Generator and returns a Generator
; into a function which accepts a gen/generator and returns a gen/generator
(defn- ->genfn
  [f]
  (fn [g] (->gen (f (Generator. g)))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Generator
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(js-comment "@constructor")
(defexport Generator (fn
  [gen]
  (invariant ^boolean (gen/generator? gen) "Generator cannot be constructed directly.")
  (this-as this (js/Object.defineProperty this "__clj_gen" #js{ "value" gen }))))

; Note: Exporting first, then defining the local var from the export ensures
; that Closure Compiler leaves the function inlined, ensuring no leakage of
; minified function names.
(def Generator (aget js/exports "Generator"))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Usage API
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defexport checkAsync (fn
  [property options]
  (let [opt (or options (js-obj))
        num-tests (or (aget opt "numTests") (aget opt "times") 100)
        max-size (or (aget opt "maxSize") 200)
        seed (aget opt "seed")
        result (pc/quick-check num-tests property :max-size max-size :seed seed)]
        (p/map (fn
          [res]
          (let [
            resultRenamed (rename-keys res {:failing-size :failingSize :num-tests :numTests})
            resultRenamedDeep (if (contains? resultRenamed :shrunk)
                            (update
                              resultRenamed
                              :shrunk
                              rename-keys
                              {:total-nodes-visited :totalNodesVisited})
                            resultRenamed)
            ]
    (clj->js resultRenamedDeep))) result))))

(defexport check (fn
  [property options]
  (let [opt (or options (js-obj))
        num-tests (or (aget opt "numTests") (aget opt "times") 100)
        max-size (or (aget opt "maxSize") 200)
        seed (aget opt "seed")
        result (tc/quick-check num-tests property :max-size max-size :seed seed)
        resultRenamed (rename-keys result {:failing-size :failingSize :num-tests :numTests})
        resultRenamedDeep (if (contains? resultRenamed :shrunk)
                            (update
                              resultRenamed
                              :shrunk
                              rename-keys
                              {:total-nodes-visited :totalNodesVisited})
                            resultRenamed)]
    (clj->js resultRenamedDeep))))

(defexport property (fn
  []
  (let [gen-len (- (alength (js-arguments)) 1)
        gen-fn (undefined-passes (aget (js-arguments) gen-len))]
    (if (and (identical? 1 gen-len) (array? (aget (js-arguments) 0)))
      (prop/for-all* (map ->gen (aget (js-arguments) 0)) gen-fn)
      (let [gens (array)]
        (loop [i 0]
          (when (< i gen-len)
            (.push gens (->gen (aget (js-arguments) i)))
            (recur (inc i))))
        (prop/for-all* gens gen-fn))))))

(defexport sample (fn
  [generator num-samples]
  (to-array (gen/sample (->gen generator) (or num-samples 10)))))

(defexport sampleOne (fn
  [generator size]
  (gen/generate (->gen generator) (or size 30))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Generators
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defexport gen (js-obj))


;; Primitives

(defexport gen.any (Generator. (gen/recursive-gen gen-array-or-object gen-primitive)))
(defexport gen.primitive (Generator. gen-primitive))

(defexport gen.boolean (Generator. gen/boolean))
(defexport gen.null (Generator. (gen/return nil)))
(defexport gen.undefined (Generator. (gen/return js/undefined)))
(defexport gen.NaN (Generator. (gen/return js/NaN)))


;; Numbers

(defexport gen.number (Generator. gen/double))
(defexport gen.posNumber (Generator. (gen/double* {:min 0, :NaN? false})))
(defexport gen.negNumber (Generator. (gen/double* {:max 0, :NaN? false})))
(defexport gen.numberWithin (fn
  [from, to]
  (invariant (number? from) "gen.numberWithin: must provide a number for a minimum size")
  (invariant (number? to) "gen.numberWithin: must provide a number for a maximum size")
  (Generator. (gen/double* {:min from, :max to, :NaN? false}))))

(defexport gen.int (Generator. gen/int))
(defexport gen.posInt (Generator. gen/pos-int))
(defexport gen.negInt (Generator. gen/neg-int))
(defexport gen.sPosInt (Generator. gen/s-pos-int))
(defexport gen.sNegInt (Generator. gen/s-neg-int))
(defexport gen.intWithin (fn
  [lower, upper]
  (invariant (number? lower) "gen.intWithin: must provide a number for a minimum size")
  (invariant (number? upper) "gen.intWithin: must provide a number for a maximum size")
  (Generator. (gen/choose lower upper))))


;; Strings

(defexport gen.string (Generator. gen/string))
(defexport gen.asciiString (Generator. gen/string-ascii))
(defexport gen.alphaNumString (Generator. gen/string-alphanumeric))

(defexport gen.substring (fn
  [string]
  (invariant (string? string) "gen.substring: must provide a string to make subtrings from")
  (Generator.
    (gen/fmap
      js-substring
      (gen/tuple
        (gen/return string)
        (gen/choose 0 (alength string))
        (gen/choose 0 (alength string)))))))

(defexport gen.char (Generator. gen/char))
(defexport gen.asciiChar (Generator. gen/char-ascii))
(defexport gen.alphaNumChar (Generator. gen/char-alphanumeric))


;; Collections

(defexport gen.array (fn
  [a b c]
  (invariant (<= 1 (.-length (js-arguments))) "gen.array: must provide a value generator or array of generators")
  (cond
    (number? c)
    (deprecated! "Use gen.array(vals, { minSize: num, maxSize: num })")

    (number? b)
    (deprecated! "Use gen.array(vals, { size: num })"))
  (Generator. (gen/fmap to-array
    (cond
      ; gen.array([ gen.int, gen.string ])
      ^boolean (js/Array.isArray a)
      (apply gen/tuple (map ->gen a))

      ; gen.array(gen.int, { opts })
      (object? b)
      (cond
        (exists? (aget b "size"))
        (gen/vector (->gen a) (aget b "size"))

        (exists? (aget b "maxSize"))
        (gen/sized (fn [size]
          (let [min-size (or (aget b "minSize") 0)
                max-size (Math/min (aget b "maxSize") (+ size min-size))]
            (gen/vector (->gen a) min-size max-size))))

        (exists? (aget b "minSize"))
        (gen/sized (fn [size]
          (let [min-size (aget b "minSize")
                max-size (+ size min-size)]
            (gen/vector (->gen a) min-size max-size))))

        :else
        (gen/vector (->gen a))
      )

      ; gen.array(gen.int, min, max) (deprecated)
      (number? c)
      (gen/vector (->gen a) b c)

      ; gen.array(gen.int, size) (deprecated)
      (number? b)
      (gen/vector (->gen a) b)

      ; gen.array(gen.int)
      :else
      (gen/vector (->gen a))
    )))))

(defexport gen.uniqueArray (fn
  [val-gen fn-or-opts opts]
  (invariant (<= 1 (.-length (js-arguments))) "gen.uniqueArray: must provide a value generator")
  (Generator. (gen/fmap to-array
    (if (function? fn-or-opts)
      (gen/list-distinct-by
        (comp js-key-fn fn-or-opts)
        (->gen val-gen)
        (gen-object-args opts))
      (gen/list-distinct-by
        js-key-fn
        (->gen val-gen)
        (gen-object-args fn-or-opts)))))))

(defexport gen.object (fn
  [a b c]
  (invariant (<= 1 (.-length (js-arguments))) "gen.object: must provide a value generator or object of generators")
  (Generator. (gen/fmap to-object
    (cond
      ; gen.object({ record: gen.int })
      (object? a)
      (gen-record a)

      ; gen.object(valGen, { opts })
      (or (nil? b) (object? b))
      (gen/map (gen/not-empty gen/string-alphanumeric) (->gen a) (gen-object-args b))

      ; gen.object(keyGen, valGen, { opts })
      :else
      (gen/map (->gen a) (->gen b) (gen-object-args c))
    )))))

(defexport gen.arrayOrObject (fn
  [val-gen]
  (invariant (<= 1 (.-length (js-arguments))) "gen.arrayOrObject: must provide a value generator")
  (Generator. (gen-array-or-object (->gen val-gen)))))

(defexport gen.nested (fn
  [collection-gen val-gen]
  (invariant (identical? 2 (.-length (js-arguments))) "gen.nested: must provide a value generator")
  (invariant (function? collection-gen) "gen.nested: must provide a function that produces a collection generator")
  (collection-gen (Generator. (gen/recursive-gen (->genfn collection-gen) (->gen val-gen))))))


;; JSON

(defexport gen.JSON (Generator. (gen-object gen-json-value)))
(defexport gen.JSONValue (Generator. gen-json-value))
(defexport gen.JSONPrimitive (Generator. gen-json-primitive))


;; Generator Creators

(defexport gen.oneOf (fn
  [gens]
  (invariant (exists? gens) "gen.oneOf: must provide generators to choose from")
  (Generator. (gen/one-of (map ->gen gens)))))

(defexport gen.oneOfWeighted (fn
  [pairs]
  (invariant (exists? pairs) "gen.oneOf: must provide generators to choose from")
  (Generator. (gen/frequency (map (fn [[weight, gen]] (array weight (->gen gen))) pairs)))))

(defexport gen.return (fn
  [value]
  (Generator. (gen/return value))))

(defexport gen.sized (fn
  [f]
  (invariant (function? f) "gen.sized: must provide function that returns a generator")
  (Generator. (gen/sized (comp ->gen f)))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Generator Prototype
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defproto Generator nullable
  []
  (this-as this (Generator. (gen/frequency [[1 (gen/return nil)] [5 (->gen this)]]))))

(defproto Generator notEmpty
  []
  (this-as this (Generator. (gen/such-that js-not-empty (->gen this)))))

(defproto Generator suchThat
  [pred]
  (invariant (function? pred) ".suchThat(): must provide function that returns a boolean")
  (this-as this (Generator. (gen/such-that pred (->gen this)))))

(defproto Generator then
  [f]
  (invariant (function? f) ".then(): must provide function that returns a value or a generator")
  (this-as this (Generator. (gen/bind (->gen this) (comp ->gen f)))))

(defproto Generator scale
  [f]
  (invariant (function? f) ".then(): must provide function that returns a new size")
  (this-as this (Generator. (gen/scale f (->gen this)))))

(defproto Generator neverShrink
  []
  (this-as this (Generator. (gen/no-shrink (->gen this)))))

(defproto Generator alwaysShrink
  []
  (this-as this (Generator. (gen/shrink-2 (->gen this)))))

(defproto Generator ~ITER_SYMBOL
  []
  (this-as this (es6-iterator (gen/sample-seq (->gen this)))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Deprecated
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defexport gen.strictPosInt
  "Use gen.sPosInt instead of gen.strictPosInt"
  (Generator. gen/s-pos-int))

(defexport gen.strictNegInt
  "Use gen.sNegInt instead of gen.strictNegInt"
  (Generator. gen/s-neg-int))

(defexport gen.suchThat
  "Use generator.where() instead of gen.suchThat(generator)"
  (fn [pred gen]
    (Generator. (gen/such-that pred (->gen gen)))))

(defexport gen.notEmpty
  "Use generator.notEmpty() instead of gen.notEmpty(generator)"
  (fn [gen max-tries]
    (Generator.
      (gen/such-that
        js-not-empty
        (->gen gen)
        (or max-tries 10)))))

(defexport gen.map
  "Use generator.then() instead of gen.map(generator)"
  (fn [f gen]
    (Generator. (gen/fmap f (->gen gen)))))

(defexport gen.bind
  "Use generator.then() instead of gen.bind(generator)"
  (fn [gen f]
    (Generator. (gen/bind (->gen gen) (fn [value] (->gen (f value)))))))

(defexport gen.resize
  "Use generator.scale(() => size) instead of gen.resize(generator, size)"
  (fn [size gen]
    (Generator. (gen/resize size (->gen gen)))))

(defexport gen.noShrink
  "Use generator.neverShrink() instead of gen.noShrink(generator)"
  (fn [gen]
    (Generator. (gen/no-shrink (->gen gen)))))

(defexport gen.shrink
  "Use generator.alwaysShrink() instead of gen.shrink(generator)"
  (fn [gen]
    (Generator. (gen/shrink-2 (->gen gen)))))

(defexport gen.returnOneOf
  "Use gen.oneOf() instead of gen.returnOneOf()"
  (fn [values]
    (Generator. (gen/elements values))))

(defexport gen.returnOneOfWeighted
  "Use gen.oneOfWeighted() instead of gen.returnOneOfWeighted()"
  (fn [pairs]
    (Generator. (gen/frequency (map (fn [[weight, value]] (array weight (gen/return value))) pairs)))))
