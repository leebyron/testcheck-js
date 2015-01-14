TestCheck [![Build Status](https://travis-ci.org/leebyron/testcheck-js.svg)](https://travis-ci.org/leebyron/testcheck-js)
=========

Generative property testing for JavaScript.

`testcheck-js` is a library for generative testing of program properties,
ala QuickCheck.

By providing a specification of the JavaScript program in the form of
properties, the properties can be tested to remain true for a large number of
randomly generated cases. In the case of a test failure, the smallest possible
test case is found.


### Use Jasmine or Mocha?

`testcheck-js` is a testing utility and not a full test running solution.

If you
use [Jasmine](http://jasmine.github.io/) then check out
[`jasmine-check`](https://github.com/leebyron/jasmine-check/), a testcheck
Jasmine plugin.

If you
use [Mocha](http://visionmedia.github.io/mocha/) then check out
[`mocha-check`](https://github.com/leebyron/mocha-check/), a testcheck
Mocha plugin.


### Atop the shoulders of giants

`testcheck-js` is based on Clojure's [test.check](https://github.com/clojure/test.check)
which is inspired by Haskell's [QuickCheck](https://hackage.haskell.org/package/QuickCheck).
It's made possible by [double-check](https://github.com/cemerick/double-check/),
the ClojureScript port of test.check. Many gracious thanks goes to all of the
brilliance and hard work enabling this project to exist.


Getting started
---------------

Install `testcheck` using npm

```shell
npm install testcheck
```

Then require it into your testing environment and start testing.

```javascript
var testcheck = require('testcheck');
var gen = testcheck.gen;

var result = testcheck.check(
  testcheck.property(
    [gen.int],
    x => x - x === 0
  )
);
```

### Typescript

If you write your tests in Typescript, include the testcheck type definitions.

```javascript
///<reference path='node_modules/testcheck/dist/testcheck.d.ts'/>
import testcheck = require('testcheck');
```


API
---

All API documentation is contained within the type definition file, [testcheck.d.ts](./type-definitions/testcheck.d.ts).


Defining properties
-------------------

A property is simply a function which is expected to always return true, we
might also call these properties "assumptions" or "expectations".

For example, say we wanted to test the assumption that any number subtracted
from itself will be `0`, we could define this property as:

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
the provided arguments to determine its return value (no other reading
or writing!).

If you can start to describe your program in terms of its properties, then
`testcheck` can test them for you.


Generating test cases
---------------------

Once we've defined some properties, we generate test cases for each properties
by describing the types of values for each argument.

For testing our first property, we need numbers:

```javascript
gen.int
```

For the second, we need arrays of numbers

```javascript
gen.array(gen.int)
```

There are a wide variety of value generators, we've only scratched the surface.
We can generate random JSON with `gen.JSON`, pick amongst a set of values with
`gen.returnOneOf`, nested arrays with ints `gen.nested(gen.array, gen.int)` and
much more. You can even define your own generators with `gen.map`, `gen.bind`
and `gen.sized`.


Checking the properties
-----------------------

Finally, we check our properties using our test case generator (in this case,
up to 1000 different tests before concluding).

```javascript
var result = testcheck.check(
  testcheck.property(
    [gen.int],    // the arguments generator
    function (x) {  // the property function to test
      return x - x === 0;
    }
  ),
  { times: 1000 }
);
```

`check` runs through random cases looking for failure, and when it doesn't find
any failures, it returns:

```javascript
{ result: true, 'num-tests': 1000, seed: 1406779597155 }
```


Smallest failing test
---------------------

Let's try another property: the sum of two integers is the same or larger than
either of the integers alone.

```javascript
testcheck.check(testcheck.property(
  [gen.int, gen.int],
  function (a, b) {
    return a + b >= a && a + b >= b;
  }
));
```

`check` runs through random cases again. This time it found a failing case, so
it returns:

```javascript
{ result: false,
  'failing-size': 2,
  'num-tests': 3,
  fail: [ 2, -1 ],
  shrunk:
   { 'total-nodes-visited': 2,
     depth: 1,
     result: false,
     smallest: [ 0, -1 ] } }
```

Something is wrong. Either:

  1. Our assumption is wrong (e.g. bug in our software).
  2. The test code is wrong.
  3. The generated test data is too broad.

In this case, our problem is that our generated data is too broad for our
assumption. What's going on?

We can see that the `fail` case `2, -1` would in fact not be correct, but it
might not be immediately clear why. This is where test case shrinking comes in
handy. The `shrunk` key provides information about the shrinking process and
most importantly, the `smallest` values that still fail: `0, -1`.

We forgot about an edge case! If one of the integers is negative, then the sum
will not be larger. This shrunken test case illustrated this much better than
the original failing test did. Now we know that we can either improve our
property or make the test data more specific:

```javascript
testcheck.check(testcheck.property(
  [gen.posInt, gen.posInt],
  function (a, b) {
    return a + b >= a && a + b >= b;
  }
));
```

With our correction, our property passes all tests.


Thinking in random distributions
--------------------------------

It's important to remember that your test is only as good as the data being
provided. While `testcheck` provides tools to generate random data, thinking
about what that data looks like may help you write better tests. Also, because
the data generated is random, a test may pass which simply failed to uncover
a corner case.

> "Testing shows the presence, not the absence of bugs"
>
> — Dijkstra, 1969

### Sampling Test Data

Visualizing the data `check` generates may help diagnose the quality of a test.
Use `sample` to get a look at what a generator produces:

```javascript
testcheck.sample(gen.int)
// [ 0, 0, 2, -1, 3, 5, -4, 0, 3, 5 ]
```

### The Size of Test Data

Test data generators have an implicit `size` property, which could be used to
determine the maximum value for a generated integer or the max length of a
generated array. `testcheck` begins by generating small test cases and gradually
increases the size.

So if you wish to test very large numbers or extremely long arrays, running
`check` the default 100 times with maxSize of 200, you may not get what
you expect.

### Data relationships

Let's test an assumption that should clearly be wrong: a string [split](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
by another string always returns an array of length 1.

```javascript
testcheck.check(testcheck.property(
  [gen.notEmpty(gen.string), gen.notEmpty(gen.string)],
  function (str, separator) {
    return str.split(separator).length === 1;
  }
));
```

Unless you got lucky, you probably saw this check pass. This is because we're
testing for a relationship between these strings. If `separator` is not found
in `str`, then this test passes. The second random string is very unlikely to
be found within the first random string.

We could change the test to be aware of this relationship such that the
`separator` is always contained within the `str`.

```javascript
testcheck.check(testcheck.property(
  [gen.notEmpty(gen.string), gen.posInt, gen.strictPosInt],
  function (str, start, length) {
    var separator = str.substr(start % str.length, length);
    return str.split(separator).length === 1;
  }
));
```

Now `separator` is a random substring of `str` and the test fails with the
smallest failing arguments: `'0', 0, 1`.


Contribution
------------

Use [Github issues](https://github.com/leebyron/testcheck-js/issues) for requests.

Pull requests actively welcomed. Learn how to [contribute](./CONTRIBUTING.md).
