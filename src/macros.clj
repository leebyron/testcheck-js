(ns macros)
(require
  '[clojure.string :as str]
  '[cljs.core :as cljs]
  '[cljs.tagged-literals :as tags])

(defmacro defexport
  ([n val]
    (let [parts (str/split (name n) #"\.")]
    `(aset js/exports ~@parts ~val)))
  ([n msg val]
    (let [parts (str/split (name n) #"\.")]
      `(js/Object.defineProperty
        (aget js/exports ~@(butlast parts))
        ~(last parts)
        ~(tags/->JSValue {
          :get `(fn []
            (cljs.user/deprecated! ~msg)
            ~val)})))))

(defmacro defproto
  [obj n & fn-tail]
  `(aset (.-prototype ~obj) ~(if (seq? n) (last n) (name n)) (fn ~@fn-tail)))

(defmacro function?
  [x]
  (with-meta (list 'js* "typeof ~{} === 'function'" x) {:tag 'boolean}))

(defmacro invariant
  [condition, msg]
  `(if (not ~condition) (throw (js/Error. ~msg))))
