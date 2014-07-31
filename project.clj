(defproject doublecheck-js "0.0.0"
  :description "Property Tests for JavaScript"

  :dependencies [
    [org.clojure/clojure "1.6.0"]
    [org.clojure/clojurescript "0.0-2268"]
    [com.cemerick/double-check "0.5.7"]
  ]

  :plugins [
    [lein-cljsbuild "1.0.4-SNAPSHOT"]
  ]

  :cljsbuild {
    :builds [
      {
        :source-paths ["src"],
        :id "release",
        :compiler {
          :output-to "dist/testcheck.js",
          :libs [""]
          :optimizations :advanced
          :output-wrapper false
          :pretty-print false
        }
      }
    ]
  }

)
