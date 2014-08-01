;; This is a stub dependency, since we're not using it and want to exclude
;; it's exports.

(ns cemerick.cljs.test)
(def ^:dynamic *test-print-fn* nil)
(def ^:dynamic *test-ctx* nil)
(defmulti report :type)
