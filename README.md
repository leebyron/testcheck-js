Property testing for plain-ol JS
================================

`testcheck-js` is a library for generative testing of program properties.

By providing a specification of the JavaScript program in the form of
properties, the properties can be tested to remain true for a large number of
randomly generated cases. In the case of a test failure, the smallest possible
test case is found.


### Atop the shoulders of giants

`testcheck-js` is based on Clojure's [test.check](https://github.com/clojure/test.check)
which is inspired by Haskell's [QuickCheck](https://hackage.haskell.org/package/QuickCheck).
It's made possible by (double-check)[https://github.com/cemerick/double-check/],
the ClojureScript port of test.check. Gracious thanks goes to all of the hard
work enabling this project to exist.


Getting started
---------------

Install `testcheck` using npm

```shell
npm install testcheck
```

Then require it into your testing environment and start testing.

```javascript
var tc = require('testcheck');
var result = tc.check(100, tc.forAll([tc.genInt], (x) => x - x === 0));
```


Defining properties
-------------------

A property is simply a function which is expected to always return true.

For example, say we wanted to ensure that any number subtracted from itself
will be 0, we could define this property as:

```javascript
function (x) {
  return x - x === 0;
}
```

Or as another example, let's determine that sorting an array is stable and
[idempotent](http://en.wikipedia.org/wiki/Idempotence), which is to say that
sorting a sorted array shouldn't do anything. We could write:

```javascript
function (arr) {
  var arrCopy = arr.slice();
  return deepEqual(arrCopy.sort(), arr.sort().sort());
}
```

That's really it! The only thing special about this property function is that it
is [pure](http://en.wikipedia.org/wiki/Pure_function), e.g. it relies only on
the arguments to determine the return value (no other reading or writing!).

If you can start to describe your program in terms of it's properties, then
`testcheck` can test them for you.


Generating tests
----------------

Once we've defined some properties, we generate test cases for each properties
by describing the types of values for each argument.

For testing our first property, we need numbers:

```javascript
tc.genInt
```

For the second, we need arrays of numbers

```javascript
tc.genArray(tc.genInt)
```

There are a wide variety of value generators, we've only scratched the surface.
We can generate random JSON with `genJSON`, pick amongst a set of values with
`genOneOfValues`, nested arrays with ints `genNested(genArray, genInt)` and
much more.


Checking the properties
-----------------------

Finally, we check our properties using our test case generator (in this case,
up to 100 different tests before giving up).

```javascript
var result = tc.check(100, tc.forAll(
  [tc.genInt],    // the test case generator
  function (x) {  // the property to test
    return x - x === 0;
  }
));
```

`check` runs through random cases looking for failure, and when it doesn't find
any failures, it returns:

```javascript
{ result: true, 'num-tests': 1000, seed: 1406779597155 }
```


<!--

TODO: this is not a good example at all.... We need and example which illustrates
how shrinking works. Maybe go hunt in QC.

Let's try another property: all integer square numbers are even.

```javascript
var result = tc.check(100, tc.forAll(
  [tc.genInt],
  function (x) {
    return (x * x) % 2 === 0;
  }
));
```

`check` found that we forgot about an edge case! Of course, 3^2 is 9, an odd number. We

```javascript
{ result: false,
  'failing-size': 3,
  'num-tests': 4,
  fail: [ 3 ],
  shrunk: {
    'total-nodes-visited': 2,
    depth: 0,
    result: false,
    smallest: [ 3 ] } }
```
 -->
