Generative property testing for Mocha
=====================================

`mocha-check` adds the generative testing power of [`testcheck-js`](https://github.com/leebyron/testcheck-js)
to [Mocha](http://visionmedia.github.io/mocha/). This allows some of your Mocha tests
to accept arguments and ensure your tests pass not just under your contrived
test cases but also pass for hundreds of randomly generated test cases.


Getting started
---------------

Install `mocha-testcheck` using npm.

```shell
npm install mocha-testcheck
```

Then include and install `mocha-testcheck` before your test suite.

```javascript
require('mocha-testcheck').install();
```


Example
-------

```javascript
require('mocha-testcheck').install();
var assert = require('assert');

describe('MySpec', function () {

  check.it('accepts an int and a string', [gen.int, gen.string], function (x, y) {
    assert(typeof x === 'number');
    assert(typeof y === 'string');
  });

});
```

The `gen` global object is provided directly by `testcheck-js` and defines what
type of random values to generate. The test will be run numerous times with
different random values, ensuring all expectations are met for every run. If a
test expectation fails, then the test will re-run with "smaller" values until
the smallest failing value is found which can better help explain edge cases
with your test and produce consistent results, despite being initially fueled
by randomness.

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

To use these options with your check, include an options object after
the description:

```js
check.it('runs 10 times', {times: 10}, [gen.strictPosInt], function (x) {
  assert(x > 0);
});
```

To learn more about property testing, or to learn about the available value
generators, check out [`testcheck-js`](https://github.com/leebyron/testcheck-js).


Mocha test interfaces
---------------------

`mocha-testcheck` supports all of Mocha's [testing interfaces](http://visionmedia.github.io/mocha/#interfaces).

### BDD

```javascript
require('mocha-testcheck').install();
var assert = require('assert');

describe('MySpec', function () {
  check.it('accepts an int', [gen.int], function (x) {
    assert(typeof x === 'number');
  });
});
```

### TDD

```javascript
require('mocha-testcheck').install();
var assert = require('assert');

suite('MySpec', function () {
  test.it('accepts an int', [gen.int], function (x) {
    assert(typeof x === 'number');
  });
});
```

### Exports

```javascript
require('mocha-testcheck').install();
var assert = require('assert');

module.exports = {
  'MySpec': {
    'accepts an int': check([gen.int], function (x) {
      assert(typeof x === 'number');
    })
  }
};
```

### Require

This interface is useful if you want to avoid global variables in your tests.

```javascript
var describe = require('mocha').describe
var assertions = require('mocha').assertions
var check = require('mocha-testcheck').check;
var gen = require('mocha-testcheck').gen;
var assert = require('assert');

describe('MySpec', function() {
  assertions('accepts an int', check([gen.int], function (x) {
    assert(typeof x === 'number');
  });
});
```
