(ns macros)
(require '[clojure.string :as str])

(defmacro defexport
  [n val]
  (let [parts (str/split (name n) #"\.")]
    (concat `(aset js/exports) parts `(~val))))
