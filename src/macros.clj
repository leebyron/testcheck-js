(ns macros)

(defmacro defexport
  [n val]
  `(js/goog.exportSymbol ~(name n) ~val))
