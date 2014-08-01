(ns testcheck
  (:require [clojure.test.check :as tc]
            [clojure.test.check.generators :as gen]
            [clojure.test.check.properties :as prop]))


;; Private helpers

(defn- gen-nested-or-val
  [collection-gen val-gen]
  (gen/sized (fn [size]
    (if (zero? size)
      val-gen
      (gen/one-of [
        val-gen
        (collection-gen (gen/resize (quot size 2) (gen-nested-or-val collection-gen val-gen)))
      ])))))

(defn- to-object
  [from-seq]
  (let [obj (js-obj)]
    (doall (map #(aset obj (first %) (second %)) from-seq))
    obj))

(defn gen-obj
  [key-gen val-gen]
  (gen/fmap to-object (gen/vector (gen/tuple key-gen val-gen))))


;; API

(def ^:export check (comp clj->js tc/quick-check))
(def ^:export forAll prop/for-all*)
(def ^:export sample (comp to-array gen/sample))


;; Generator Builders

(def ^:export genSuchThat gen/such-that)
(def ^:export genNotEmpty (partial gen/such-that (comp not-empty js->clj)))
(def ^:export genMapped gen/fmap)
(def ^:export genBind gen/bind)
(def ^:export genSized gen/sized)
(def ^:export genResize gen/resize)
(def ^:export genNoShrink gen/no-shrink)
(def ^:export genAlwaysShrink gen/shrink-2)


;; Simple Generators

(def ^:export genReturn gen/return)
(def ^:export genReturnOneOf gen/elements)
(def ^:export genOneOf gen/one-of)
(def ^:export genOneOfWeighted gen/frequency)
(defn ^:export genNested
  [collection-gen val-gen]
  (collection-gen (gen-nested-or-val collection-gen val-gen)))


;; Array and Object

(defn ^:export genArray
  ([val-gen min-elements max-elements] (gen/fmap to-array (gen/vector val-gen min-elements max-elements)))
  ([val-gen num-elements] (gen/fmap to-array (gen/vector val-gen num-elements)))
  ([val-gen-or-arr] (gen/fmap to-array
    (if (js/Array.isArray val-gen-or-arr)
      (apply gen/tuple val-gen-or-arr)
      (gen/vector val-gen-or-arr)))))

(defn ^:export genObject
  ([key-gen val-gen] (gen/fmap clj->js (gen-obj key-gen val-gen)))
  ([val-gen-or-obj]
    (if (= js/Object (.-constructor val-gen-or-obj))
      (let [seq (js->clj val-gen-or-obj)
        ks (keys seq)
        vs (vals seq)]
        (gen/fmap clj->js
          (gen/fmap (partial zipmap ks)
                    (apply gen/tuple vs))))
      (gen-obj (gen/resize 16 gen/string-alpha-numeric) val-gen-or-obj))))

(defn ^:export genArrayOrObject
  [val-gen]
  (gen/one-of [(genArray val-gen) (genObject val-gen)]))


;; JS Primitives

;; TODO: Floating-point Number
;; TODO: UTF8 strings
;; TODO: More performant string generation?
;; TODO: Weights on genPrimitive

(def ^:export genNaN (gen/return js/NaN))
(def ^:export genUndefined (gen/return js/undefined))
(def ^:export genNull (gen/return nil))
(def ^:export genBoolean gen/boolean)

(def ^:export genInt gen/int)
(def ^:export genPosInt gen/pos-int)
(def ^:export genNegInt gen/neg-int)
(def ^:export genStrictPosInt gen/s-pos-int)
(def ^:export genStrictNegInt gen/s-neg-int)
(def ^:export genIntWithin gen/choose)

(def ^:export genChar gen/char)
(def ^:export genAsciiChar gen/char-ascii)
(def ^:export genAlphaChar gen/char-alpha)
(def ^:export genAlphaNumericChar gen/char-alpha-numeric)

(def ^:export genString gen/string)
(def ^:export genAsciiString gen/string-ascii)
(def ^:export genAlphaString gen/string-alpha)
(def ^:export genAlphaNumericString gen/string-alpha-numeric)

(def ^:export genPrimitive
  (gen/one-of [genNaN genUndefined genNull gen/boolean gen/int gen/string]))
(def ^:export genPrintablePrimitive
  (gen/one-of [genNaN genUndefined genNull gen/boolean gen/int gen/string-ascii]))


;; JSON

(def ^:export genJSONPrimitive
  (gen/one-of [genNull gen/boolean gen/int gen/string]))
(def ^:export genJSONValue (gen-nested-or-val genArrayOrObject genJSONPrimitive))
(def ^:export genJSON (genObject genJSONValue))


;; Any JS value, potentially nested

(def ^:export genAny (gen-nested-or-val genArrayOrObject genPrimitive))
