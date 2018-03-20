---
permalink: /api
layout: default
toc: true
---

API Documentation
=================

The `testcheck` npm module exports six values:

```js
const {
  check,
  property,
  sample,
  sampleOne,
  gen,
  Generator
} = require('testcheck')
```

* `check`: Runs a property test.
* `property`: Defines a property test.
* `sample` & `sampleOne`: Samples generator values for debugging.
* `gen`: A collection of *Generator*s and functions that return *Generator*s.
* `Generator`: The class which all *Generator*s are instances of.

> Try it! Open the developer console to take the API for a test run.


Running Tests
-------------

### check()

Given a property to check, return the result of the check.

If the property generates a false value, check will shrink the generator
and return a Result which includes the `shrunk` key.

```js
const { check, property, gen } = require('testcheck')

check(property(gen.int, n => n - n === 0), { numTests: 1000 })
// { result: true, seed: 1482203464997, numTests: 1000 }
```

**Parameters**

```
check(property[, options])
```

* `property`: A *Property* created via the `property()` function.

* `options`: An optional Object of options with the properties:

  * `numTests`: Number of times to check the property. Default: `100`

  * `maxSize`: The maximum "size" to provide to generators. Default: `200`

  * `seed`: The seed to use for the random number generator. Default: *<Random>*

**Returns**

An Object with the properties:

  * `result`: `true` if the check passed, otherwise `false` or any *Error* thrown.

  * `numTests`: The number of times the `property` was tested with generated values.

  * `seed`: The random number seed used for this check, pass this seed within `options`
            to get the exact same tests.

  * `fail`: The arguments `property` generated when and if this check failed.

  * `failingSize`: The size used when and if this check failed.

  * `shrunk`: When a check fails, the failing arguments shrink to find the
              smallest value that fails, resulting in an Object with properties:

    * `smallest`: The smallest arguments with this result.

    * `result`: `true` if the check passed, otherwise `false` or any *Error* thrown.

    * `depth`: The depth of the shrunk result.

    * `totalNodesVisited`: The number of nodes shrunk to result in this smallest failing value.


### property()

Creates a *Property* as needed by `check()`.

Accepts any number of value generators, the results of which become the
arguments of the property function. The property function should return
`true` if the property is upheld, or `false` if it fails.

```js
const numGoUp = property(gen.int, gen.posInt, (a, b) => a + b > a);
check(numGoUp);
```

Property functions may also throw an *Error* when a property fails, which is
helpful for testing code that uses assertions or testing with checking libraries
such as [chai](http://chaijs.com/).

```js
const { expect } = require('chai')

const allIntsArePositive = property(gen.int, num => {
  expect(num).to.be.at.least(0);
})

const test = check(allIntsArePositive)
console.log(test.shrunk.result)
// AssertionError: expected -1 to be at least 0
```

**Parameters**

```
property(gen[, gen2[, ...genN]], propertyFn)
```

* `gen`: Any *Generator* object. Values from which will be provided as arguments to `propertyFn`. Multiple *Generator*s may be provided, each of which will produce another function argument.

* `propertyFn`: *Function* representing a property that should always be true. Returns `true` when the property is upheld and `false` when the property fails.

**Returns**

A *Property* to be used by `check()`.


### sample()

Handy tool for visualizing the output of a *Generator*.

Given a *Generator*, it returns an *Array* of values resulting from the generator.

```js
sample(gen.int)
// [ 0, 1, 1, 2, 3, 3, -6, 1, -3, -8 ]
```

**Parameters**

```
sample(generator[, numValues])
```

* `generator`: Any *Generator* object.

* `numValues`: The number of values to produce. Default: `10`.

By default 10 samples are provided unless otherwise specified.

**Returns**

An *Array* of values from `generator`.


### sampleOne()

Handy tool for visualizing the output of your *Generator*.

Given a *Generator*, it returns a single value generated for a given `size`.

```js
sampleOne(gen.int)
// 24
```

**Parameters**

```
sample(generator[, size])
```

* `generator`: Any *Generator* object.

* `size`: The size of the value to produce. Default: `30`.

**Returns**

A single value from `generator`.



Primitive Value Generators
--------------------------

### gen.any

Generates any JS value, including Arrays and Objects (possibly nested).


### gen.primitive

Generates any primitive JS value: strings, numbers, booleans, `null`, `undefined`, or `NaN`.


### gen.boolean

Generates `true` or `false` values.


### gen.null

Generates only the value `null`.


### gen.undefined

Generates only the value `undefined`.


### gen.NaN

Generates only the value `NaN`.



Number Generators
-----------------

### gen.number

Generates floating point numbers (including `+Infinity`, `-Infinity`, and `NaN`).


### gen.posNumber

Generates only positive numbers (`0` though `+Infinity`), does not generate `NaN`.


### gen.negNumber

Generates only negative numbers (`0` though `-Infinity`), does not generate `NaN`.


### gen.numberWithin()

Generates a floating point number within the provided (inclusive) range.
Does not generate `NaN` or `Infinity`.

Note: The resulting *Generator* is not shrinkable.

**Parameters**

```
gen.numberWithin(min, max)
```

* `min` The smallest possible number to generate (inclusive).

* `max` The largest possible number to generate (inclusive).


### gen.int

Generator integers (32-bit signed) including negative numbers and `0`.


### gen.posInt

Generates positive integers, including 0.


### gen.negInt

Generates negative integers, including 0.


### gen.sPosInt

Generates only strictly positive integers, not including 0.


### gen.sNegInt

Generates only strictly negative integers, not including 0.


### gen.intWithin()

Generates an integer within the provided (inclusive) range.

Note: The resulting *Generator* is not shrinkable.

**Parameters**

```
gen.intWithin(min, max)
```

* `min` The smallest possible integer to generate (inclusive).

* `max` The largest possible integer to generate (inclusive).



String Generators
-----------------


### gen.string

Generates strings of arbitrary characters.

```js
sample(gen.string)
// [ '', 'c', '¸Ã', 'uq', 'd.', '', 'FÏs', 'Ú\u0019oÞ', 'Ô', 'ßÞ' ]
```

Note: strings of arbitrary characters may result in higher-plane Unicode
characters and non-printable characters.


### gen.asciiString

Generates strings of printable ascii characters.

```js
sample(gen.asciiString)
// [ '', 'j', ':o', 'EM5', 'I]', '', 'GCeTvG', '\'\\zB+', '8gc7y', 'g3Ei' ]
```


### gen.alphaNumString

Generates strings of only alpha-numeric characters: a-z, A-Z, 0-9.

```js
sample(gen.alphaNumString)
// [ '', 'N', 'T', 's9', 'wm', 'eT', '9', 'lNu', 'h', '81EvZX' ]
```


### gen.substring()

Generates substrings of an original string (including the empty string).

```js
sample(gen.substring('abracadabra'))
// [ 'ac', 'r', 'abra', 'braca', 'a', 'ad', 'b', 'r', '', 'abra' ]
```

**Parameters**

```
gen.substring(original)
```

* `original` The original string from which to generate substrings.



### gen.char

Generates arbitrary 1-byte characters (code 0 through 255).

```js
sample(gen.char)
// [ 'ã', '}', '£', 'O', '\u000b', '±', '\n', '\u0007', 'ÿ', 'b' ]
```


### gen.asciiChar

Generates only printable ascii characters (code 32 through 126).

```js
sample(gen.asciiChar)
// [ 'q', '-', '8', 'I', 'O', ';', 'A', 'm', '3', '9' ]
```


### gen.alphaNumChar

Generates only alpha-numeric characters: a-z, A-Z, 0-9.

```js
sample(gen.alphaNumChar)
// [ 'x', '8', 'T', '9', '5', 'w', 'U', 'a', 'J', 'f' ]
```



Collection Generators
---------------------

### gen.array()

Generates Arrays of values. There are a few forms `gen.array` can be used:

- Generate Arrays of random sizes (ex. arrays of integers).

  ```js
  gen.array(gen.int)
  ```

- Generate Arrays of specific sizes (ex. length of 5).

  ```js
  gen.array(gen.int, { size: 5 })
  ```

- Generate Arrays of random sizes within a specific range (ex. between 2 and 10).

  ```js
  gen.array(gen.int, { minSize: 2, maxSize: 10 })
  ```

- Generate Arrays of specific lengths with different kinds of values at
  each index, also known as "tuples",

  For example, a tuples of [ *int*, *bool* ] like `[3, true]`:

  ```js
  gen.array([ gen.int, gen.boolean ])
  ```

**Parameters**

```
gen.array(valueGen[, options])
```

* `valueGen`: A *Generator* which will produce the values of the resulting Arrays.

* `options`: An optional object of options describing the size of the resulting Arrays:

  * `size`: If provided, the exact size of the resulting Array.

  * `minSize`: If provided, the minimum size of the resulting Array.

  * `maxSize`: If provided, the maximum size of the resulting Array.


### gen.uniqueArray()

Generates Arrays of unique values.

Accepts the same size options as gen.array()

Also optionally accepts a function to determine how to determine if a value
is unique. For example, if generating [x, y] points as Arrays, JavaScript cannot
determine if two Arrays are unique. By providing a function, the points can be
converted to strings first so they can be compared.

```js
var genPoint = gen.array([ gen.int, gen.int ])
var genUniquePoints = gen.uniqueArray(genPoint, point => point.join())

sampleOne(genUniquePoints)
// [ [ -9, -3 ], [ -1, -1 ], [ 2, -2 ], [ -11, -6 ], [ 9, -4 ] ]
```

**Parameters**

```
gen.array(valueGen[, uniqueFn][, options])
```

* `valueGen`: A *Generator* which will produce the values of the resulting Arrays.

* `uniqueFn`: A Function which accepts a value from `valueGen` and returns a value
              which can be compared with `===` to determine uniqueness.

* `options`: An optional object of options describing the size of the resulting Arrays:

  * `size`: If provided, the exact size of the resulting Array.

  * `minSize`: If provided, the minimum size of the resulting Array.

  * `maxSize`: If provided, the maximum size of the resulting Array.


### gen.object()

Generates Objects of values. There are a few forms `gen.object` can be used:

- Generate Objects with a specified kind of value and alpha-numeric keys.

  ```js
  gen.object(gen.int)
  ```

- Generate Objects of a specific size

  ```js
  gen.object(gen.int, { size: 5 })
  ```

- Generate Objects with a specified kind of key and value, (ex. numeric keys).

  ```js
  gen.object(gen.int, gen.int)
  ```

- Generate Objects with specific keys with different kinds of values at
  each key, also known as "records".

  For example, a 2D point like `{ x: 3, y: 5 }`:

  ```js
  gen.object({ x: gen.posInt, y: gen.posInt })
  ```

**Parameters**

```
gen.object([keyGen, ]valueGen[, options])
```

* `keyGen`: An optional *Generator* which will produce the keys of the resulting Objects.

* `valueGen`: A *Generator* which will produce the values of the resulting Objects.

* `options`: An optional object of options describing the size of the resulting Objects:

  * `size`: If provided, the exact size of the resulting Object.

  * `minSize`: If provided, the minimum size of the resulting Object.

  * `maxSize`: If provided, the maximum size of the resulting Object.


### gen.arrayOrObject()

Generates either an Array or an Object with values of the provided kind.

```js
sample(gen.arrayOrObject(gen.int), 5)
// [ [], {}, [ 1 ], { y96: -1, hfR: 1 }, [ -3, -7, 7, -5, 5 ] ]
```

Note: Objects will be produced with alpha-numeric keys.

**Parameters**

```
gen.arrayOrObject(valueGen)
```

* `valueGen`: A *Generator* which will produce the values of the resulting Arrays or Objects.


### gen.nested()

Given a function which takes a *Generator* and returns a *Generator* (such as
`gen.array` or `gen.object`), and a *Generator* to use as values, creates
potentially nested values.

```js
const deepArrayOfInts = gen.nested(gen.array, gen.int)

sampleOne(deepArrayOfInts)
// [ 0, [ -2 ], 1, [] ]
```

Note: It may generate just values, not wrapped in a container.

**Parameters**

```
gen.nested(collectionGenFn, valueGen)
```

* `collectionGenFn`: A Function which accepts a *Generator* (like `valueGen`) and returns a new *Generator* which presumably generates collections that contain the provided *Generator*.

* `valueGen`: A *Generator* which will produce the values within the resulting collections.



JSON Generators
---------------

### gen.JSON

Generates JSON Objects where each key is a JSON value.


### gen.JSONValue

Generates JSON values: primitives, or (possibly nested) arrays or objects.


### gen.JSONPrimitive

Generates JSON primitives: strings, numbers, booleans and `null`.



Generator Creators
------------------

### gen.oneOf()

Creates a *Generator* which will generate one of the provided values or values
from one of the provided *Generator*s.

```js
const numOrBool = gen.oneOf([ gen.int, gen.boolean ])

sample(numOrBool)
// [ false, true, 0, -3, -2, false, -3, false, 6, 8 ]
```

In addition to *Generators*, you can also provide normal values to `gen.oneOf()`,
for example, picking one value from an Array of values:

```js
const colors = [ 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet' ]
const genColors = gen.oneOf(colors)

sample(genColors, 5)
// [ 'Red', 'Blue', 'Blue', 'Violet', 'Red' ]
```

**Parameters**

```
gen.oneOf(arrayOfGens)
```

* `arrayOfGens`: An Array which contains either a *Generator* or value at each index.


### gen.oneOfWeighted()

Similar to `gen.oneOf()`, except provides probablistic "weights" to each generator.

```js
const numOrRarelyBool = gen.oneOfWeighted([[10, gen.int], [1, gen.boolean]])

sample(numOrRarelyBool)
// [ 0, 0, false, -1, 0, -3, -4, -7, 4, -4 ]
```

**Parameters**

```
gen.oneOfWeighted(arrayOfWeightsAndGens)
```

* `arrayOfWeightsAndGens`: An Array of "tuples" (two-sized Arrays):

  * `[ weight, valueGen ]`

    * `weight`: A number to determine how frequent this selection is relative
      to other selections.

    * `valueGen`: A *Generator* or value to use should this selection be chosen.


### gen.return()

Creates a *Generator* which will always generate the provided value.

This is used very rarely since almost everywhere a *Generator* can be accepted,
a regular value can be accepted as well, which implicitly is converted to a
*Generator* using `gen.return()`. However you may wish to use `gen.return()`
directly to either be explicit, or resolve an ambiguity.

```js
const alwaysBlue = gen.return('blue');

sample(alwaysBlue)
[ 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue' ]
```

**Parameters**

```
gen.return(value)
```

* `value`: The value to always generate.


### gen.sized()

Creates a *Generator* that relies on a `size`. Size allows for the "shrinking"
of *Generators*. A larger "size" should result in a larger generated value.

Typically `gen.sized()` is not used directly in a test, but may be used when
building custom *Generator*s. Many of the *Generator*s in this library are built
with `gen.sized()`.

For example, `gen.int` is shrinkable because it is implemented as:

```
gen.int = gen.sized(size => gen.intWithin(-size, size))
```

**Parameters**

```
gen.sized(genFn)
```

* `genFn`: A Function which accepts a `size` and returns a *Generator*.



*Generator*
-----------

A *Generator* object produces values of a particular kind. *Generator*s cannot
be constructed directly, but instead are obtained by one of the `gen` values
or functions described above, or as the result of calling one of the prototype
methods of another *Generator* object.

```js
// A generator of integers
const genInt = gen.int

// A generator of arrays of integers
const genIntArray = gen.array(gen.int)

// A generator of non-empty arrays of integers
const genNonEmptyIntArray = gen.array(gen.int).notEmpty()
```


### Generator#nullable()

Creates a new *Generator* which also sometimes generates `null` values.

```js
// A generator of integers or nulls.
const genNullableInt = gen.int.nullable()

sample(genNullableInt)
// [ 0, -1, null, null, 1, 4, 3, -3, -5, null ]
```

**Returns**

A new *Generator*.


### Generator#notEmpty()

Creates a new *Generator* which generates non-empty values.

Examples of empty values are `0`, `""`, `null`, `[]`, and `{}`

```js
const notEmptyStrings = gen.asciiString.notEmpty()

sample(notEmptyStrings, 5)
// [ 'f', 'SJ', '8?sH{', 'zWUb}X1', '.AS Mz.x7' ]
```

**Returns**

A new *Generator*.


### Generator#suchThat()

Creates a new *Generator* which ensures that all values generated adhere to
the given predicate function.

For example, to create a *Generator* of any number except multiples of 5:

```js
var genAnythingBut5s = gen.int.suchThat(n => n % 5 !== 0);

sample(genAnythingBut5s)
// [ 0, 1, -1, 2, 4, -3, 6, 2, 4, -7 ]
```

Note: Care is needed to ensure there is a high chance the predicate will
pass. After ten attempts an exception will throw.

**Parameters**

```
g.suchThat(predicateFn)
```

* `predicateFn` A function which accepts a `value` from the *Generator* and
  returns `true` if it is allowed, or `false` if not.

**Returns**

A new *Generator*.


### Generator#then()

Creates a new *Generator* that depends on the values of this *Generator*.

For example, to create a *Generator* of square numbers:

```js
var genSquares = gen.int.then(n => n * n);

sample(genSquares)
// [ 0, 0, 4, 9, 1, 16, 0, 36, 25, 81 ]
```

For example, to create a *Generator* which first generates an Array of
integers, and then returns both that Array and a sampled value from it:

```js
var genList = gen.array(gen.int).notEmpty();
var genListAndItem = genList.then(
  list => gen.array([ list, gen.oneOf(list) ])
);

sample(genListAndItem, 3)
// [ [ [ 1 ], 1 ], [ [ 2, -1 ], 2 ], [ [ -3, 2, -1 ], 2 ] ]
```

**Parameters**

```
g.then(mappingFn)
```

* `mappingFn` A function which accepts a `value` from the *Generator* and
  returns either a new value, or a new *Generator*.

**Returns**

A new *Generator*.


### Generator#scale()

Creates a new Generator which grows at a different scale.

Generators start by producing very "small" values (closer to 0) at first,
and produce larger values in later iterations of a test as a result of a
"size" value which grows with each generation. Typically "size" grows
linearly, but .scale() can alter a size to grow at different rates.

For example, to generate "big" numbers that grow super-linearly (cubicly):

```
var bigInts = gen.int.scale(n => n * n * n)

sample(bigInts)
// [ 0, 1, 5, 0, -59, -56, -160, 261, 409, -34 ]
```

Note: When shrinking a failing test, "size" gets smaller. If the scale
function returns a value that's not dependent on it's input, then the
resulting Generator will not shrink.


**Parameters**

```
g.scale(sizingFn)
```

* `sizingFn` A function which accepts a `size` number and returns a new size.

**Returns**

A new *Generator*.


### Generator#neverShrink()

Creates a new Generator which will never shrink.
This is useful when shrinking is taking a long time or is not applicable.

**Returns**

A new *Generator*.


### Generator#alwaysShrink()

Creates a new Generator which will always consider shrinking, even if the
property passes (up to one additional level).

**Returns**

A new *Generator*.
