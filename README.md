Generative property testing for Jasmine
=======================================

`jasmine-check` adds the generative testing power of `testcheck-js` to Jasmine.
This allows some of your Jasmine tests to accept arguments and ensure your tests
pass not just under your contrived test cases but also pass for hundreds of
randomly generated test cases.


Getting started
---------------

Install `jasmine-check` using npm.

```shell
npm install jasmine-check
```

Then include and install `jasmine-check` in a spec.

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

The `gen` global object is provided directly by `testcheck-js`. To learn more
about property testing, or to learn about the available value generators,
check out [`testcheck-js`](https://github.com/leebyron/testcheck-js).


Notes
-----

`jasmine-check` is currently designed against the `1.3.x` version of Jasmine
used in [`jasmine-node`](https://github.com/mhevery/jasmine-node).
