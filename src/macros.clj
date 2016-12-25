(ns macros)
(require '[clojure.string :as str])

(defmacro defexport
  [n val]
  (let [parts (str/split (name n) #"\.")]
    `(aset js/exports ~@parts ~val)))

(defmacro defproto
  [obj n & fn-tail]
  `(aset (.-prototype ~obj) ~(if (seq? n) (last n) (name n)) (fn ~@fn-tail)))

(defmacro function?
  [x]
  (with-meta (list 'js* "typeof ~{} === 'function'" x) {:tag 'boolean}))

(defmacro invariant
  [condition, msg]
  `(if (not ~condition) (throw (js/Error. ~msg))))
