Generative property testing for Tape
====================================

`tape-check` adds the generative testing power of [`testcheck-js`](https://github.com/leebyron/testcheck-js)
to [Tape](https://github.com/substack/tape). This allows some of your Tape tests
to accept arguments and ensure your tests pass not just under your contrived
test cases but also pass for hundreds of randomly generated test cases.


Getting started
---------------

Install `tape-check` using yarn.

```sh
yarn add --dev tape-check
```

Or using npm

```sh
npm install --save-dev tape-check
```

Then include `tape-check` in your test.

```js
const { check, gen } = require('tape-check')
```


Example
-------

```js
const test = require('tape')
const { check, gen } = require('tape-check')

test('addition is commutative', check(gen.int, gen.int, (t, numA, numB) => {
  t.plan(1)
  t.equal(numA + numB, numB + numA)
}));
```

The `gen` object is provided directly by `testcheck` and defines what type of
values to generate. The test will be run numerous times with randomly generated
values, ensuring all expectations are met for every run. If a test expectation
fails, then the test will re-run with "smaller" values until the smallest
failing value is found which can better help explain edge cases with your test
and produce consistent results, despite being initially fueled by randomness.

For example, here's a test which we expect would fail:

```js
const test = require('tape')
const { check, gen } = require('tape-check')

test('division is commutative', check(gen.sPosInt, gen.sPosInt, (t, numA, numB) => {
  t.plan(1)
  t.equal(numA / numB, numB / numA)
}));
```

When we run this test, we find the smallest failing test:

```sh
> tape test.js
TAP version 13
# division is commutative
not ok 1 should be equal ( 1, 2 )
  ---
    operator: equal
    expected: 0.5
    actual:   2
    at: Test.check (test.js:6:5)
  ...

1..1
# tests 1
# pass  0
# fail  1
```


### Options

If a test is taking a long time, needs to generate larger values, or should be
run with a consistent random seed, you can alter the behavior with `options`:

```js
{
  times: number;   // the number of test cases to run. Default: 100
  maxSize: number; // the maximum "size" of the test data. Default: 200
  seed: number;    // defaults to a random value from 1 to 2^32-1.
}
```

To use these options with your check, include an options object before the
argument generators.

```js
test('runs 10 times', check({ times: 10 }, gen.posInt, (t, n) => {
  t.plan(1)
  t.true(x >= 0)
}))
```

To learn more about property testing, or to learn about the tapeilable value
generators, check out [`testcheck`](https://github.com/leebyron/testcheck-js).
