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
    (doall (map #(aset obj (name (first %)) (second %)) from-seq))
    obj))


;; API

(def ^:export check (comp clj->js tc/quick-check))
(def ^:export forAll prop/for-all*)
(def ^:export sample (comp to-array gen/sample))


;; Filters and Predicates

(def ^:export genSuchThat gen/such-that)
(def ^:export genNotEmpty (partial gen/such-that (comp not-empty js->clj)))


;; Simple Generators

(def ^:export genValue gen/return)
(def ^:export genOneOfValues gen/elements)
(def ^:export genOneOf gen/one-of)
(def ^:export genOneOfWeighted gen/frequency)
(defn ^:export genNested
  [collection-gen val-gen]
  (collection-gen (gen-nested-or-val collection-gen val-gen)))


;; Tuples and Maps

(def ^:export genTuple (comp (partial gen/fmap to-array) gen/tuple))
(defn ^:export genMap
  [obj]
  (let [seq (js->clj obj)
        ks (keys seq)
        vs (vals seq)]
    (gen/fmap to-object
      (gen/fmap (partial zipmap ks)
                (apply gen/tuple vs)))))


;; Array and Object

(def ^:export genArray (comp (partial gen/fmap to-array) gen/vector))
(defn ^:export genObject
  ([val-gen] (genObject gen/string val-gen))
  ([key-gen val-gen] (gen/fmap to-object (gen/map key-gen val-gen))))
(defn ^:export genArrayOrObject
  [val-gen]
  (gen/one-of [(genArray val-gen) (genObject val-gen)]))


;; JS Primitives
;; TODO: Floating-point Number
;; TODO: UTF8 strings
;; TODO: Weights on genPrimitive

(def ^:export genNaN (gen/return js/NaN))
(def ^:export genUndefined (gen/return js/undefined))
(def ^:export genNull (gen/return nil))
(def ^:export genBoolean gen/boolean)

(def ^:export genInt gen/int)
(def ^:export genPositiveInt gen/pos-int)
(def ^:export genNegativeInt gen/neg-int)
(def ^:export genStrictlyPositiveInt gen/s-pos-int)
(def ^:export genStrictlyNegativeInt gen/s-neg-int)
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
