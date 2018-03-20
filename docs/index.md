TestCheck.js [![Build Status](https://travis-ci.org/leebyron/testcheck-js.svg)](https://travis-ci.org/leebyron/testcheck-js)
============

Generative property testing for JavaScript.

`TestCheck.js` is a library for generative testing of program properties,
ala QuickCheck.

By providing a specification of the JavaScript program in the form of
properties, the properties can be tested to remain true for a large number of
randomly generated cases. In the case of a test failure, the smallest possible
failing test case is found.



Getting started
---------------

Install `testcheck` using yarn

```sh
yarn add --dev testcheck
```

Or using npm

```sh
npm install --save-dev testcheck
```

Then require it into your testing environment and start testing.

```js
const { check, gen, property } = require('testcheck');

const result = check(
  property(
    gen.int,
    x => x - x === 0
  )
)
```

### Have a favorite test framework?

`TestCheck.js` is a testing utility and not a complete test-running framework. It
doesn't replace test frameworks like AVA, Jasmine, or Mocha.

If you use [AVA](https://github.com/avajs/ava/) then check out
[ava-check](https://github.com/leebyron/testcheck-js/tree/master/integrations/ava-check), a testcheck
AVA plugin.

```js
const test = require('ava')
const { check, gen } = require('ava-check')

test('addition is commutative', check(gen.int, gen.int, (t, numA, numB) => {
  t.true(numA + numB === numB + numA)
}))
```

If you use [Jasmine](http://jasmine.github.io/) or [Jest](https://facebook.github.io/jest/) then check out
[jasmine-check](https://github.com/leebyron/testcheck-js/tree/master/integrations/jasmine-check), a testcheck
Jasmine (or Jest) plugin.

```js
require('jasmine-check').install()

describe('Maths', () => {
  check.it('addition is commutative', gen.int, gen.int, (numA, numB) => {
    expect(numA + numB).toEqual(numB + numA)
  })
})
```

If you use [Mocha](http://mochajs.org/) then check out
[mocha-testcheck](https://github.com/leebyron/testcheck-js/tree/master/integrations/mocha-testcheck), a testcheck
Mocha plugin.

```js
require('mocha-testcheck').install();
const { expect } = require('chai');

describe('Maths', () => {
  check.it('addition is commutative', gen.int, gen.int, (numA, numB) => {
    expect(numA + numB).to.equal(numB + numA)
  })
})
```

If you use [Tape](https://github.com/substack/tape/) then check out
[tape-check](https://github.com/leebyron/testcheck-js/tree/master/integrations/tape-check), a testcheck
Tape plugin.

```js
const test = require('tape')
const { check, gen } = require('tape-check')

test('addition is commutative', check(gen.int, gen.int, (t, numA, numB) => {
  t.plan(1)
  t.equal(numA + numB, numB + numA)
}));
```

### Type definitions

This module includes type definitions for [Flow type](http://flowtype.org/) and
[Typescript](https://www.typescriptlang.org/). Simply require or import this
module and enjoy type suggestions and corrections.



Using TestCheck.js
------------------

See the complete [API documentation](http://leebyron.com/testcheck-js/api) for
all available generators and utilities, or the [Walkthrough Guide](http://leebyron.com/testcheck-js/) for a more thorough walkthrough.

> Try it! Open the developer console while viewing [the docs](http://leebyron.com/testcheck-js/) to follow along with the examples below.

### Defining properties

A property is simply a function which is expected to always return true, we
might also call these properties "assumptions" or "expectations".

For example, say we wanted to test the assumption that any number subtracted
from itself will be `0`, we could define this property as:

```js
function (x) {
  return x - x === 0
}
```

Or as another example, let's determine that sorting an array is stable and
[idempotent](http://en.wikipedia.org/wiki/Idempotence), which is to say that
sorting a sorted array shouldn't do anything. We could write:

```js
function (arr) {
  var arrCopy = arr.slice()
  return deepEqual(arrCopy.sort(), arr.sort().sort())
}
```

That's really it! The only thing special about this property function is that it
is [pure](http://en.wikipedia.org/wiki/Pure_function), e.g. it relies only on
the provided arguments to determine its return value (no other reading
or writing!).

If you can start to describe your program in terms of its properties, then
`testcheck` can test them for you.


### Generating test cases

Once we've defined some properties, we generate test cases for each properties
by describing the types of values for each argument.

For testing our first property, we need numbers:

```js
gen.int
```

For the second, we need arrays of numbers

```js
gen.array(gen.int)
```

There are a wide variety of value generators, we've only scratched the surface.
We can generate random JSON with `gen.JSON`, pick amongst a set of values with
`gen.returnOneOf`, nested arrays with ints `gen.nested(gen.array, gen.int)` and
much more. You can even define your own generators with `generator.then()`,
and `gen.sized`.


### Checking the properties

Finally, we check our properties using our test case generator (in this case,
up to 1000 different tests before concluding).

```js
const result = check(
  property(
    // the arguments generator
    gen.int,
    // the property function to test
    x => x - x === 0
  ),
  { numTests: 1000 }
)
```

`check` runs through random cases looking for failure, and when it doesn't find
any failures, it returns:

```js
{ result: true, numTests: 1000, seed: 1406779597155 }
```


### Smallest failing test

Let's try another property: the sum of two integers is the same or larger than
either of the integers alone.

```js
check(
  property(
    gen.int, gen.int,
    (a, b) => a + b >= a && a + b >= b
  )
)
```

`check` runs through random cases again. This time it found a failing case, so
it returns:

```js
{ result: false,
  failingSize: 2,
  numTests: 3,
  fail: [ 2, -1 ],
  shrunk:
   { totalNodesVisited: 2,
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

```js
check(property(
  gen.posInt, gen.posInt,
  (a, b) => a + b >= a && a + b >= b
));
```

With our correction, our property passes all tests.


### Thinking in random distributions

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
Use `sample` and `sampleOne` to get a look at what a generator produces:

```js
const { gen, sample, sampleOne } = require('testcheck')

sample(gen.int)
// [ 0, 0, 2, -1, 3, 5, -4, 0, 3, 5 ]

sampleOne(gen.int)
// -23
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

```js
check(property(
  gen.asciiString.notEmpty(), gen.asciiString.notEmpty(),
  (str, separator) => str.split(separator).length === 1
))
```

Unless you got lucky, you probably saw this check pass. This is because we're
testing for a relationship between these strings. If `separator` is not found
in `str`, then this test passes. The second unrelated random string is very
unlikely to be found within the first random string.

We could change the test to be aware of this relationship such that the
`separator` is always contained within the `str` by using `then()`.

```js
check(property(
  gen.asciiString.notEmpty().then(str =>
    gen.array([ str, gen.substring(str).notEmpty() ])),
  ([ str, separator ]) => str.split(separator).length === 1
))
```

Now `separator` is a random substring of `str` and the test fails with the
smallest failing arguments: `[ ' ', ' ' ]`.

We can test this example out ourselves, with the value `' '` generated for both
`str` and `separator`, we can run `' '.split(' ').length` to see that we in
fact get `2`, not `1`.



License
-------

Copyright 2014-Present Lee Byron

TestCheck.js is distributed under the BSD-3-Clause license.

#### Atop the shoulders of giants

`TestCheck.js` is based on Clojure's [test.check](https://github.com/clojure/test.check)
which is inspired by Haskell's [QuickCheck](https://hackage.haskell.org/package/QuickCheck). Many gracious thanks goes to all of the brilliance and hard work enabling this project to exist.

Clojure's test.check is Copyright Rich Hickey, Reid Draper and contributors and is
distributed under the Eclipse Public License.
