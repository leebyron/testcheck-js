(require '[clojure.test.check :as tc])
(require '[clojure.test.check.generators :as gen])
(require '[clojure.test.check.properties :as prop])
(use '[clojure.set :only (rename-keys)])

;; API

(defn ^{:export check} check
  [property options]
  (let [opt (or options (js-obj))
        num-tests (or (aget opt "times") 100)
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
    (clj->js resultRenamedDeep)))

(def ^{:export property} property prop/for-all*)

(defn ^{:export sample} sample
  [generator times]
  (let [num-samples (or times 10)]
    (to-array
      (gen/sample generator num-samples))))
