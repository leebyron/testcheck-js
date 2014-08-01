rm dist/testcheck.js
lein do clean, cljsbuild once
sed -e '/CLOSURE_OUTPUT/ {
  r dist/testcheck.js
  d
}' resources/module.js > dist/testcheck.js.tmp
mv dist/testcheck.js.tmp dist/testcheck.js
