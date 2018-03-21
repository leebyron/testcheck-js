(require-macros '[macros :refer [defexport defproto function? invariant]])
(require
  '[clojure.test.check :as tc]
  '[clojure.test.check.generators :as gen]
  '[clojure.test.check.properties :as prop]
  '[clojure.set :refer [rename-keys]]
  '[clojure.string :refer [split join]])

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

(defn- map-obj [obj f]
  (let [new-obj (js-obj)
        ks (js-keys obj)
        l (.-length ks)]
    (loop [i 0]
      (when (< i l)
        (let [k (aget ks i)]
          (aset new-obj k (f (aget obj k)))
          (recur (inc i)))))
    new-obj))

(defn- deep-copy
  [x]
  (cond
    ^boolean (js/Array.isArray x) (.map x deep-copy)
    (identical? (.-constructor x) js/Object) (map-obj x deep-copy)
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

(defn- gen-return-deep-copy
  [x]
  (gen/fmap deep-copy (gen/return x)))


;; Converting between ValueGenerator and gen/generator

(declare ValueGenerator)

(defn ^boolean ValueGenerator?
  [x]
  (and ^boolean x (exists? (aget x "__clj_gen"))))

(declare convert-gen)

; Iterates through a provided Array. If any value is a ValueGenerator or
; contains a ValueGenerator, then a gen/tuple is returned.
(defn convert-array-gen
  [x]
  (let [l (.-length x)]
    (loop [i 0]
      (if (identical? i l)
        x
        (let [v (aget x i)
              r (convert-gen v)]
          (if (identical? v r)
            (recur (inc i))
            (let [gens (make-array l)]

              ; Wrap previous indices
              (loop [j 0]
                (when (< j i)
                  (aset gens j (gen-return-deep-copy (aget x j)))
                  (recur (inc j))))

              ; Set
              (aset gens i r)

              ; Convert remainder
              (loop [j (inc i)]
                (if (< j l)
                  (let [v2 (aget x j)
                        r2 (convert-gen v2)]
                    (aset gens j (if (identical? v2 r2) (gen-return-deep-copy v2) r2))
                    (recur (inc j)))))

              ; Return tuple generator
              (gen/fmap to-array (apply gen/tuple gens)))))))))

; Iterates through a provided Object. If any value is a ValueGenerator or
; contains a ValueGenerator, then a record generator is returned.
(defn convert-object-gen
  [x]
  (let [ks (js-keys x)
        l (.-length ks)]
    (loop [i 0]
      (if (identical? i l)
        x
        (let [v (aget x (aget ks i))
              r (convert-gen v)]
          (if (identical? v r)
            (recur (inc i))
            (let [gens (make-array l)]

              ; Wrap previous indices
              (loop [j 0]
                (when (< j i)
                  (aset gens j (gen-return-deep-copy (aget x (aget ks j))))
                  (recur (inc j))))

              ; Set
              (aset gens i r)

              ; Convert remainder
              (loop [j (inc i)]
                (if (< j l)
                  (let [v2 (aget x (aget ks j))
                        r2 (convert-gen v2)]
                    (aset gens j (if (identical? v2 r2) (gen-return-deep-copy v2) r2))
                    (recur (inc j)))))

              ; Return record generator
              (gen/fmap
                (comp to-object (partial zipmap ks))
                (apply gen/tuple gens)))))))))

; Common point of the recursive production of ValueGenerators from values.
; If it's a collection, walk through the collection lazily converting to gens
; until it finds one, then gen-return-deep-copy all previous entries. Otherwise
; return the original value.
(defn convert-gen
  [x]
  (cond
    (ValueGenerator? x) (aget x "__clj_gen")
    (array? x) (convert-array-gen x)
    (object? x) (convert-object-gen x)
    :else x
  ))

; If provided a JS ValueGenerator, converts it to a Clojure gen/generator.
; If provided a primitive, Array, or Object, deeply converts it to a
; Clojure gen/generator.
(defn ->gen
  [x]
  (if (ValueGenerator? x)
    (aget x "__clj_gen") ; Short-circuit common case
    (do
      (assert (not ^boolean (gen/generator? x)))
      (let [r (convert-gen x)]
        (if (identical? x r) (gen-return-deep-copy x) r)))))

; Converts a function which accepts a ValueGenerator and returns a ValueGenerator
; into a function which accepts a gen/generator and returns a gen/generator
(defn- ->genfn
  [f]
  (fn [g] (->gen (f (ValueGenerator. g)))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ValueGenerator
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(js-comment "@constructor")
(defexport ValueGenerator (fn
  [gen]
  (invariant ^boolean (gen/generator? gen) "ValueGenerator cannot be constructed directly.")
  (this-as this (js/Object.defineProperty this "__clj_gen" #js{ "value" gen }))))

; Note: Exporting first, then defining the local var from the export ensures
; that Closure Compiler leaves the function inlined, ensuring no leakage of
; minified function names.
(def ValueGenerator (aget js/exports "ValueGenerator"))

; Deprecated. Use ValueGenerator to avoid confusion with JS generator functions.
(defexport ValueGenerator
  "Use ValueGenerator instead of ValueGenerator"
  ValueGenerator)


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Usage API
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

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
;; Value ValueGenerators
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defexport gen (fn
  [x]
  (ValueGenerator. (->gen x))))


;; Primitives

(defexport gen.any (ValueGenerator. (gen/recursive-gen gen-array-or-object gen-primitive)))
(defexport gen.primitive (ValueGenerator. gen-primitive))

(defexport gen.boolean (ValueGenerator. gen/boolean))
(defexport gen.null (ValueGenerator. (gen/return nil)))
(defexport gen.undefined (ValueGenerator. (gen/return js/undefined)))
(defexport gen.NaN (ValueGenerator. (gen/return js/NaN)))


;; Numbers

(defexport gen.number (ValueGenerator. gen/double))
(defexport gen.posNumber (ValueGenerator. (gen/double* {:min 0, :NaN? false})))
(defexport gen.negNumber (ValueGenerator. (gen/double* {:max 0, :NaN? false})))
(defexport gen.numberWithin (fn
  [from, to]
  (invariant (number? from) "gen.numberWithin: must provide a number for a minimum size")
  (invariant (number? to) "gen.numberWithin: must provide a number for a maximum size")
  (ValueGenerator. (gen/double* {:min from, :max to, :NaN? false}))))

(defexport gen.int (ValueGenerator. gen/int))
(defexport gen.posInt (ValueGenerator. gen/pos-int))
(defexport gen.negInt (ValueGenerator. gen/neg-int))
(defexport gen.sPosInt (ValueGenerator. gen/s-pos-int))
(defexport gen.sNegInt (ValueGenerator. gen/s-neg-int))
(defexport gen.intWithin (fn
  [lower, upper]
  (invariant (number? lower) "gen.intWithin: must provide a number for a minimum size")
  (invariant (number? upper) "gen.intWithin: must provide a number for a maximum size")
  (ValueGenerator. (gen/choose lower upper))))


;; Strings

(defexport gen.string (ValueGenerator. gen/string))
(defexport gen.asciiString (ValueGenerator. gen/string-ascii))
(defexport gen.alphaNumString (ValueGenerator. gen/string-alphanumeric))

(defexport gen.substring (fn
  [string]
  (invariant (string? string) "gen.substring: must provide a string to make subtrings from")
  (ValueGenerator.
    (gen/fmap
      js-substring
      (gen/tuple
        (gen/return string)
        (gen/choose 0 (alength string))
        (gen/choose 0 (alength string)))))))

(defexport gen.char (ValueGenerator. gen/char))
(defexport gen.asciiChar (ValueGenerator. gen/char-ascii))
(defexport gen.alphaNumChar (ValueGenerator. gen/char-alphanumeric))


;; Collections

(defexport gen.array (fn
  [a b c]
  (invariant (<= 1 (.-length (js-arguments))) "gen.array: must provide a value generator")
  (cond
    (number? c)
    (deprecated! "Use gen.array(vals, { minSize: num, maxSize: num })")

    (number? b)
    (deprecated! "Use gen.array(vals, { size: num })")

    (and (identical? 1 (.-length (js-arguments))) ^boolean (js/Array.isArray a))
    (deprecated! "Just provide the array of generators directly without gen.array(), or use gen()."))
  (ValueGenerator. (gen/fmap to-array
    (cond
      ; gen.array([ gen.int, gen.string ])
      (and (identical? 1 (.-length (js-arguments))) ^boolean (js/Array.isArray a))
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
  (ValueGenerator. (gen/fmap to-array
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
  (invariant (<= 1 (.-length (js-arguments))) "gen.object: must provide a value generator")
  (if (and (identical? 1 (.-length (js-arguments))) (object? a))
    (deprecated! "Just provide the object with generator values directly without gen.object(), or use gen()."))
  (ValueGenerator. (gen/fmap to-object
    (cond
      ; gen.object({ record: gen.int })
      (and (identical? 1 (.-length (js-arguments))) (object? a))
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
  (ValueGenerator. (gen-array-or-object (->gen val-gen)))))

(defexport gen.nested (fn
  [collection-gen val-gen]
  (invariant (identical? 2 (.-length (js-arguments))) "gen.nested: must provide a value generator")
  (invariant (function? collection-gen) "gen.nested: must provide a function that produces a collection generator")
  (collection-gen (ValueGenerator. (gen/recursive-gen (->genfn collection-gen) (->gen val-gen))))))


;; JSON

(defexport gen.JSON (ValueGenerator. (gen-object gen-json-value)))
(defexport gen.JSONValue (ValueGenerator. gen-json-value))
(defexport gen.JSONPrimitive (ValueGenerator. gen-json-primitive))


;; ValueGenerator Creators

(defexport gen.oneOf (fn
  [gens]
  (invariant (exists? gens) "gen.oneOf: must provide generators to choose from")
  (ValueGenerator. (gen/one-of (map ->gen gens)))))

(defexport gen.oneOfWeighted (fn
  [pairs]
  (invariant (exists? pairs) "gen.oneOf: must provide generators to choose from")
  (ValueGenerator. (gen/frequency (map (fn [[weight, gen]] (array weight (->gen gen))) pairs)))))

(defexport gen.return (fn
  [value]
  (ValueGenerator. (gen/return value))))

(defexport gen.returnDeepCopy (fn
  [value]
  (ValueGenerator. (gen-return-deep-copy value))))

(defexport gen.sized (fn
  [f]
  (invariant (function? f) "gen.sized: must provide function that returns a generator")
  (ValueGenerator. (gen/sized (comp ->gen f)))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ValueGenerator Prototype
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defproto ValueGenerator nullable
  []
  (this-as this (ValueGenerator. (gen/frequency [[1 (gen/return nil)] [5 (->gen this)]]))))

(defproto ValueGenerator notEmpty
  []
  (this-as this (ValueGenerator. (gen/such-that js-not-empty (->gen this)))))

(defproto ValueGenerator suchThat
  [pred]
  (invariant (function? pred) ".suchThat(): must provide function that returns a boolean")
  (this-as this (ValueGenerator. (gen/such-that pred (->gen this)))))

(defproto ValueGenerator then
  [f]
  (invariant (function? f) ".then(): must provide function that returns a value or a generator")
  (this-as this (ValueGenerator. (gen/bind (->gen this) (comp ->gen f)))))

(defproto ValueGenerator scale
  [f]
  (invariant (function? f) ".then(): must provide function that returns a new size")
  (this-as this (ValueGenerator. (gen/scale f (->gen this)))))

(defproto ValueGenerator neverShrink
  []
  (this-as this (ValueGenerator. (gen/no-shrink (->gen this)))))

(defproto ValueGenerator alwaysShrink
  []
  (this-as this (ValueGenerator. (gen/shrink-2 (->gen this)))))

(defproto ValueGenerator ~ITER_SYMBOL
  []
  (this-as this (es6-iterator (gen/sample-seq (->gen this)))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Deprecated
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defexport gen.strictPosInt
  "Use gen.sPosInt instead of gen.strictPosInt"
  (ValueGenerator. gen/s-pos-int))

(defexport gen.strictNegInt
  "Use gen.sNegInt instead of gen.strictNegInt"
  (ValueGenerator. gen/s-neg-int))

(defexport gen.suchThat
  "Use generator.where() instead of gen.suchThat(generator)"
  (fn [pred gen]
    (ValueGenerator. (gen/such-that pred (->gen gen)))))

(defexport gen.notEmpty
  "Use generator.notEmpty() instead of gen.notEmpty(generator)"
  (fn [gen max-tries]
    (ValueGenerator.
      (gen/such-that
        js-not-empty
        (->gen gen)
        (or max-tries 10)))))

(defexport gen.map
  "Use generator.then() instead of gen.map(generator)"
  (fn [f gen]
    (ValueGenerator. (gen/fmap f (->gen gen)))))

(defexport gen.bind
  "Use generator.then() instead of gen.bind(generator)"
  (fn [gen f]
    (ValueGenerator. (gen/bind (->gen gen) (fn [value] (->gen (f value)))))))

(defexport gen.resize
  "Use generator.scale(() => size) instead of gen.resize(generator, size)"
  (fn [size gen]
    (ValueGenerator. (gen/resize size (->gen gen)))))

(defexport gen.noShrink
  "Use generator.neverShrink() instead of gen.noShrink(generator)"
  (fn [gen]
    (ValueGenerator. (gen/no-shrink (->gen gen)))))

(defexport gen.shrink
  "Use generator.alwaysShrink() instead of gen.shrink(generator)"
  (fn [gen]
    (ValueGenerator. (gen/shrink-2 (->gen gen)))))

(defexport gen.returnOneOf
  "Use gen.oneOf() instead of gen.returnOneOf()"
  (fn [values]
    (ValueGenerator. (gen/elements values))))

(defexport gen.returnOneOfWeighted
  "Use gen.oneOfWeighted() instead of gen.returnOneOfWeighted()"
  (fn [pairs]
    (ValueGenerator. (gen/frequency (map (fn [[weight, value]] (array weight (gen/return value))) pairs)))))
