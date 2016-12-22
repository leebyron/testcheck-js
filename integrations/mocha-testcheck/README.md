Generative property testing for Mocha
=====================================

`mocha-testcheck` adds the generative testing power of [`testcheck`](https://github.com/leebyron/testcheck-js)
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
const { expect } = require('chai');

describe('MySpec', () => {

  check.it('accepts an int and a string', gen.int, gen.string, (x, y) => {
    expect(x).to.be.a('number');
    expect(y).to.be.a('string');
  });

});
```

The `gen` global object is provided directly by `testcheck` and defines what
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
check.it('runs 10 times', {times: 10}, gen.sPosInt, num => {
  assert(x > 0);
});
```

To learn more about property testing, or to learn about the available value
generators, check out [`testcheck`](https://github.com/leebyron/testcheck-js).


Mocha test interfaces
---------------------

`mocha-testcheck` supports all of Mocha's [testing interfaces](http://visionmedia.github.io/mocha/#interfaces).

### BDD

```javascript
require('mocha-testcheck').install();
const { expect } = require('chai');

describe('MySpec', () => {
  check.it('accepts an int', gen.int, x => {
    expect(x).to.be.a('number');
  });
});
```

### TDD

```javascript
require('mocha-testcheck').install();
const { expect } = require('chai');

suite('MySpec', () => {
  check.test('accepts an int', gen.int, x => {
    expect(x).to.be.a('number');
  });
});
```

### Exports

```javascript
require('mocha-testcheck').install();
const { expect } = require('chai');

module.exports = {
  'MySpec': {
    'accepts an int': check(gen.int, x => {
      expect(x).to.be.a('number');
    })
  }
};
```

### Require

This interface is useful if you want to avoid global variables in your tests.

```javascript
const { describe, it } = require('mocha');
const { check, gen } = require('mocha-testcheck');
const { expect } = require('chai');

describe('MySpec', () => {
  it('accepts an int', check(gen.int, x => {
    expect(x).to.be.a('number');
  });
});
```
