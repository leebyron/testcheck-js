(require '[clojure.test.check.generators :as gen])

;; Private helpers

(defn- gen-nested-or-val
  [collection-gen val-gen]
  (gen/sized (fn [size]
    (if (zero? size)
      val-gen
      (gen/one-of [
        val-gen
        (collection-gen
          (gen/resize
            (quot size 2)
            (gen-nested-or-val collection-gen val-gen)))])))))

(defn- to-object
  [from-seq]
  (let [obj (js-obj)]
    (doall (map #(aset obj (first %) (second %)) from-seq))
    obj))

(defn- gen-obj
  [key-gen val-gen]
  (gen/fmap to-object (gen/vector (gen/tuple key-gen val-gen))))


;; Generator Builders

(def ^{:export gen.suchThat} genSuchThat gen/such-that)
(def ^{:export gen.notEmpty} genNotEmpty
  (partial gen/such-that (comp not-empty js->clj)))
(defn ^{:export gen.map} genMap [gen f] (gen/fmap f gen))
(def ^{:export gen.bind} genBind gen/bind)
(def ^{:export gen.sized} genSized gen/sized)
(def ^{:export gen.resize} genResize gen/resize)
(def ^{:export gen.noShrink} genNoShrink gen/no-shrink)
(def ^{:export gen.shrink} genShrink gen/shrink-2)


;; Simple Generators

(js/goog.exportSymbol "gen.return", gen/return)
(def ^{:export gen.returnOneOf} genReturnOneOf gen/elements)
(def ^{:export gen.oneOf} genOneOf gen/one-of)
(def ^{:export gen.oneOfWeighted} genOneOfWeighted gen/frequency)
(defn ^{:export gen.returnOneOfWeighted} genReturnOneOfWeighted
  [pairs]
  (gen/frequency (map vector
    (map first pairs)
    (map (comp gen/return second) pairs))))
(defn ^{:export gen.nested} genNested
  [collection-gen val-gen]
  (collection-gen (gen-nested-or-val collection-gen val-gen)))


;; Array and Object

(defn ^{:export gen.array} genArray
  ([val-gen min-elements max-elements]
    (gen/fmap to-array (gen/vector val-gen min-elements max-elements)))
  ([val-gen num-elements]
    (gen/fmap to-array (gen/vector val-gen num-elements)))
  ([val-gen-or-arr]
    (gen/fmap to-array
      (if (js/Array.isArray val-gen-or-arr)
        (apply gen/tuple val-gen-or-arr)
        (gen/vector val-gen-or-arr)))))

(defn ^{:export gen.object} genObject
  ([key-gen val-gen]
    (gen/fmap clj->js (gen-obj key-gen val-gen)))
  ([val-gen-or-obj]
    (if (= js/Object (.-constructor val-gen-or-obj))
      (let [seq (into {} (for [k (js-keys val-gen-or-obj)] [k (aget val-gen-or-obj k)]))
        ks (keys seq)
        vs (vals seq)]
        (gen/fmap clj->js
          (gen/fmap (partial zipmap ks)
                    (apply gen/tuple vs))))
      (gen-obj (gen/not-empty gen/string-alphanumeric) val-gen-or-obj))))

(defn ^{:export gen.arrayOrObject} genArrayOrObject
  [val-gen]
  (gen/one-of [(genArray val-gen) (genObject val-gen)]))


;; JS Primitives

;; TODO: UTF8 strings
;; TODO: More performant string generation?

(def ^{:export gen.NaN} genNaN (gen/return js/NaN))
(def ^{:export gen.undefined} genUndefined (gen/return js/undefined))
(def genNull (gen/return nil))
(js/goog.exportSymbol "gen.null", genNull)
(js/goog.exportSymbol "gen.boolean", gen/boolean)

(js/goog.exportSymbol "gen.number", gen/double)
(def ^{:export gen.posNumber} genPosDouble (gen/double* {:min 0, :NaN? false}))
(def ^{:export gen.negNumber} genNegDouble (gen/double* {:max 0, :NaN? false}))
(defn ^{:export gen.numberWithin} genNumberWithin
  [from, to]
  (gen/double* {:min from, :max to, :NaN? false}))

(js/goog.exportSymbol "gen.int", gen/int)
(def ^{:export gen.posInt} genPosInt gen/pos-int)
(def ^{:export gen.negInt} genNegInt gen/neg-int)
(def ^{:export gen.strictPosInt} genStrictPosInt gen/s-pos-int)
(def ^{:export gen.strictNegInt} genStrictNegInt gen/s-neg-int)
(def ^{:export gen.intWithin} genIntWithin gen/choose)

(js/goog.exportSymbol "gen.char", gen/char)
(def ^{:export gen.asciiChar} genAsciiChar gen/char-ascii)
(def ^{:export gen.alphaNumChar} genAlphaNumChar gen/char-alphanumeric)

(def ^{:export gen.string} genString gen/string)
(def ^{:export gen.asciiString} genAsciiString gen/string-ascii)
(def ^{:export gen.alphaNumString} genAlphaNumString gen/string-alphanumeric)


;; JSON

(def ^{:export gen.JSONPrimitive} genJSONPrimitive
  (gen/frequency [[1 genNull]
                  [2 gen/boolean]
                  [3 (gen/double* {:infinite? false, :NaN? false})]
                  [10 gen/int]
                  [10 gen/string]]))
(def ^{:export gen.JSONValue} genJSONValue
  (gen-nested-or-val genArrayOrObject genJSONPrimitive))
(def ^{:export gen.JSON} genJSON (genObject genJSONValue))


;; JS values, potentially nested

(def ^{:export gen.primitive} genPrimitive
  (gen/frequency [[1 genUndefined]
                  [2 genNull]
                  [4 gen/boolean]
                  [6 gen/double]
                  [20 gen/int]
                  [20 gen/string]]))

(def ^{:export gen.any} genAny
  (gen-nested-or-val genArrayOrObject genPrimitive))
