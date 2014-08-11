(ns testcheck
  (:require [clojure.test.check :as tc]
            [clojure.test.check.generators :as gen]
            [clojure.test.check.properties :as prop]))


;; API

(defn ^{:export check} check
  [property options]
  (let [opt (or options (js-obj))
        num-tests (or (aget opt "times") 100)
        max-size (or (aget opt "maxSize") 200)
        seed (aget opt "seed")]
    (clj->js
      (tc/quick-check num-tests property :max-size max-size :seed seed))))

(def ^{:export property} property prop/for-all*)

(defn ^{:export sample} sample
  [generator options]
  (let [opt (or options (js-obj))
        num-samples (or (aget opt "times") 10)
        max-size (or (aget opt "maxSize") 200)
        seed (aget opt "seed")
        r (if seed (gen/random seed) (gen/random))]
    (to-array
      (take num-samples
        (map
          (comp gen/rose-root (partial gen/call-gen generator r))
          (gen/make-size-range-seq max-size))))))
