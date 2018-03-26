(defproject doublecheck-js "0.0.0"
  :description "Property Tests for JavaScript"

  :source-paths ["src"]

  :dependencies [
    [org.clojure/clojure "1.9.0-alpha14"]
    [org.clojure/clojurescript "1.9.293"]
    [org.clojure/test.check "0.9.0"]
    [io.nervous/promesa-check "0.1.1"]]

  :plugins [
    [lein-cljsbuild "1.1.5"]]

  :cljsbuild {
    :builds [{
      :source-paths ["src"],
      :id "release",
      :compiler {
        :output-to "dist/testcheck.js",
        :libs [""]
        :optimizations :advanced
        :output-wrapper false
        :pretty-print false }}]})
