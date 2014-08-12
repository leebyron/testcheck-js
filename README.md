Generative property testing for Jasmine
=======================================

`jasmine-check` adds the generative testing power of [`testcheck-js`](https://github.com/leebyron/testcheck-js)
to [Jasmine](http://jasmine.github.io/). This allows some of your Jasmine tests
to accept arguments and ensure your tests pass not just under your contrived
test cases but also pass for hundreds of randomly generated test cases.


Getting started
---------------

Install `jasmine-check` using npm.

```shell
npm install jasmine-check
```

Then include and install `jasmine-check` before your test suite.

```javascript
require('jasmine-check').install();
```


Example
-------

```javascript
require('jasmine-check').install();

describe('MySpec', function () {

  check.it('accepts an int and a string', [gen.int, gen.string], function(x, y) {
    expect(x).toEqual(jasmine.any(Number));
    expect(y).toEqual(jasmine.any(String));
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

To learn more about property testing, or to learn about the available value
generators, check out [`testcheck-js`](https://github.com/leebyron/testcheck-js).


Notes
-----

`jasmine-check` is currently only supported for use with [`jasmine-node`](https://github.com/mhevery/jasmine-node)
and against the `1.3.x` version of Jasmine.
