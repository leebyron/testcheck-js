rm dist/*
lein do clean, cljsbuild once
cp type-definitions/testcheck.d.ts dist/
cp type-definitions/testcheck.js.flow dist/
