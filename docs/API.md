---
permalink: /api
layout: default
toc: true
---

API Documentation
=================

check()
-------

Given a property to check, return the result of the check.

A "property" is a Generator of booleans which should always generate true.
If the property generates a false value, check will shrink the generator
and return a Result which includes the `shrunk` key.

```js
const { check, property, gen } = require('testcheck')

check(property(gen.int, n => n - n === 0), { times: 1000 })
// { result: true, seed: 1482203464997, numTests: 1000 }
```

#### Parameters

```
check(property[, options])
```

* `property`: A *Generator* which generates a `boolean`, typically created via
  the `property()` function.

* `options`: An optional Object of options with the properties:

  * `times`: Number of times to check the property. Default: `100`

  * `maxSize`: The maximum "size" to provide to generators. Default: `200`

  * `seed`: The seed to use for the random number generator. Default: *<Random>*

#### Returns

An Object with the properties:

  * `result`: `true` if the check passed, otherwise `false`.

  * `numTests`: The number of times the `property` was tested with generated values.

  * `seed`: The random number seed used for this check, pass this seed within `options`
            to get the exact same tests.

  * `fail`: The arguments `property` generated when and if this check failed.

  * `failingSize`: The size used when and if this check failed.

  * `shrunk`: When a check fails, the failing arguments shrink to find the
              smallest value that fails, resulting in an Object with properties:

    * `smallest`: The smallest arguments with this result.

    * `result`: `true` if the check passed, otherwise `false`.

    * `depth`: The depth of the shrunk result.

    * `totalNodesVisited`: The number of nodes shrunk to result in this smallest failing value.


property()
----------

Creates a "property" as needed by `check()`.

Accepts any number of value generators, the results of which become the
arguments of the property function. The property function should return
true if the property is upheld, or false if it fails.

```js
const numGoUp = property(gen.int, gen.posInt, (a, b) => a + b > a);
check(numGoUp);
```

#### Parameters

```
property(gen[, gen2[, ...genN]], propertyFn)
```

* `gen`: Any *Generator* object. Values from which will be provided as arguments to `propertyFn`. Multiple *Generator*s may be provided, each of which will produce another function argument.

* `propertyFn`: *Function* representing a property that should always be true. Returns `true` when the property is upheld and `false` when the property fails.

#### Returns

A *Generator* of boolean values.


sample()
--------

Handy tool for visualizing the output of your generators. Given a *Generator*,
it returns an *Array* of values resulting from the generator.

```js
sample(gen.int)
// [ 0, 1, 1, 2, 3, 3, -6, 1, -3, -8 ]
```

#### Parameters

```
sample(generator[, numValues])
```

* `generator`: Any *Generator* object.

* `numValues`: The number of values to produce. Default: `10`.

By default 10 samples are provided unless otherwise specified.

#### Returns

An *Array* of values from `generator`.


*Generator*
-----------

A *Generator* object produces values of a particular kind. *Generator*s cannot
be constructed directly, but instead are obtained by one of the `gen` values
or functions, or as the result of calling one of the prototype methods of another
*Generator* object.

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

#### Returns

A new *Generator*.


### Generator#notEmpty()

Creates a new *Generator* which generates non-empty values.

Examples of empty values are `0`, `""`, `null`, `[]`, and `{}`

```js
const notEmptyStrings = gen.asciiString.notEmpty()

sample(notEmptyStrings, 5)
// [ 'f', 'SJ', '8?sH{', 'zWUb}X1', '.AS Mz.x7' ]
```

#### Returns

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

#### Parameters

```
g.suchThat(predicateFn)
```

* `predicateFn` A function which accepts a `value` from the *Generator* and
  returns `true` if it is allowed, or `false` if not.

#### Returns

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
var genList = gen.notEmpty(gen.array(gen.int))
var genListAndItem = genList.then(
  list => gen.array([ list, gen.oneOf(list) ])
);

sample(genListAndItem, 3)
// [ [ [ 1 ], 1 ], [ [ 2, -1 ], 2 ], [ [ -3, 2, -1 ], 2 ] ]
```

#### Parameters

```
g.then(mappingFn)
```

* `mappingFn` A function which accepts a `value` from the *Generator* and
  returns either a new value, or a new *Generator*.

#### Returns

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


#### Parameters

```
g.scale(sizingFn)
```

* `sizingFn` A function which accepts a `size` number and returns a new size.

#### Returns

A new *Generator*.


### Generator#neverShrink()

Creates a new Generator which will never shrink.
This is useful when shrinking is taking a long time or is not applicable.

#### Returns

A new *Generator*.


### Generator#alwaysShrink()

Creates a new Generator which will always consider shrinking, even if the
property passes (up to one additional level).

#### Returns

A new *Generator*.


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

#### Parameters

```
gen.numberWithin(min, max)
```

* `min` The smallest possible number to generate (inclusive).

* `max` The largest possible number to generate (inclusive).


  /**
   * A sized, shrinkable generator producing integers.
   */
  int: Generator<number>;

  /**
   * Only positive integers (0 through +Inf)
   */
  posInt: Generator<number>;

  /**
   * Only negative integers (0 through -Inf)
   */
  negInt: Generator<number>;

  /**
   * Only strictly positive integers (1 through +Inf)
   */
  strictPosInt: Generator<number>;

  /**
   * Only strictly negative integers (1 through -Inf)
   */
  strictNegInt: Generator<number>;

  /**
   * Generates an integer within the provided (inclusive) range.
   * The resulting Generator is not shrinkable.
   */
  intWithin: (min: number, max: number) => Generator<number>;


  // Strings
  // -------

  /**
   * Generates strings. Note: strings of arbitrary characters may result in
   * Unicode characters and non-printable characters.
   */
  string: Generator<string>;

  /**
   * Generates strings of printable Ascii characters.
   */
  asciiString: Generator<string>;

  /**
   * Generates strings of [a-zA-Z0-9]*
   */
  alphaNumString: Generator<string>;

  /**
   * Generates substrings of the original string, including the empty string.
   */
  substring: (original: string) => Generator<string>;

  /**
   * Generates ascii characters (code 0 through 255).
   */
  char: Generator<string>;

  /**
   * Generates printable ascii characters (code 32 through 126).
   */
  asciiChar: Generator<string>;

  /**
   * Generates ascii characters matching /a-zA-Z0-9/
   */
  alphaNumChar: Generator<string>;


  // Collections: Arrays and Objects
  // -------------------------------

  /**
   * Generates Arrays of values. There are a few forms `gen.array` can be used:
   *
   *  - Generate Arrays of random sizes (ex. arrays of integers)
   *
   *     gen.array(gen.int)
   *
   *  - Generate Arrays of specific sizes (ex. length of 5)
   *
   *     gen.array(gen.int, { size: 5 })
   *
   *  - Generate Arrays of random sizes within a specific range
   *    (ex. between 2 and 10)
   *
   *     gen.array(gen.int, { minSize: 2, maxSize: 10 })
   *
   *  - Generate Arrays of specific lengths with different kinds of values at
   *    each index (e.g. tuples). (ex. tuples of [int, bool] like `[3, true]`)
   *
   *     gen.array([ gen.int, gen.boolean ])
   *
   */
  array: {
    <T>(valueGen: Generator<T>): Generator<Array<T>>;
    <T>(valueGen: Generator<T>, options?: SizeOptions): Generator<Array<T>>;
    <T1, T2, T3, T4, T5>(tupleGens: [T1 | Generator<T1>, T2 | Generator<T2>, T3 | Generator<T3>, T4 | Generator<T4>, T5 | Generator<T5>]): Generator<[T1, T2, T3, T4, T5]>;
    <T1, T2, T3, T4>(tupleGens: [T1 | Generator<T1>, T2 | Generator<T2>, T3 | Generator<T3>, T4 | Generator<T4>]): Generator<[T1, T2, T3, T4]>;
    <T1, T2, T3>(tupleGens: [T1 | Generator<T1>, T2 | Generator<T2>, T3 | Generator<T3>]): Generator<[T1, T2, T3]>;
    <T1, T2>(tupleGens: [T1 | Generator<T1>, T2 | Generator<T2>]): Generator<[T1, T2]>;
    <T1>(tupleGens: [T1 | Generator<T1>]): Generator<[T1]>;
  };

  /**
   * Generates Arrays of unique values.
   *
   * Accepts the same size options as gen.array()
   *
   * Optionally also accepts a function to determine how to determine if a value
   * is unique. For example, if 2d points are the same:
   *
   *     var genPoint = gen.array([ gen.int, gen.int ])
   *     var genUniquePoints = gen.uniqueArray(genPoint, point => point.join())
   *
   */
  uniqueArray: {
    <T>(valueGen: Generator<T>, options?: SizeOptions): Generator<Array<T>>;
    <T>(valueGen: Generator<T>, uniqueBy: (value: T) => any, options?: SizeOptions): Generator<Array<T>>;
  };

  /**
   * Generates Objects of values. There are a few forms `gen.object` can be used:
   *
   *  - Generate Objects with random keys (alpha-numeric keys, up to 16 chars)
   *
   *     gen.object(gen.int)
   *
   *  - Generate Objects with a specified kind of key and value,
   *    (ex. numeric keys)
   *
   *     gen.object(gen.int, gen.int)
   *
   *  - Generate Objects with specific keys with different kinds of values at
   *    each key (e.g. records). (ex. a 2d point like `{ x: 3, y: 5 }`)
   *
   *     gen.object({ x: gen.posInt, y: gen.posInt })
   *
   */
  object: {
    <T>(valueGen: Generator<T>, options?: SizeOptions): Generator<{[key: string]: T}>;
    <T>(keyGen: Generator<string>, valueGen: Generator<T>, options?: SizeOptions): Generator<{[key: string]: T}>;
    (genMap: {[key: string]: Generator<any>}): Generator<{[key: string]: any}>;
  };

  /**
   * Generates either an Array or an Object with values of the provided kind.
   */
  arrayOrObject: <T>(
    valueGen: Generator<T>
  ) => Generator<{[key: string]: T; [key: number]: T}>;

  /**
   * Given a function which takes a generator and returns a generator (such as
   * `gen.array` or `gen.object`), and a Generator to use as values, creates
   * potentially nested values.
   *
   *     gen.nested(gen.array, gen.int)
   *     // [ [ 0, [ -2 ], 1, [] ]
   *
   */
  nested: <C, T>(
    collectionGenFn: (valueGen: Generator<T>) => Generator<C>,
    valueGen: Generator<T>
  ) => Generator<C>;


  // JSON
  // ----

  /**
   * Generates JSON objects where each key is a JSON value.
   */
  JSON: Generator<{[key: string]: any}>;

  /**
   * Generates JSON values: primitives, or (possibly nested) arrays or objects.
   */
  JSONValue: Generator<any>;

  /**
   * Generates JSON primitives: strings, numbers, booleans and null.
   */
  JSONPrimitive: Generator<any>;


  // Generator Creators
  // ------------------

  /**
   * Creates a Generator which will generate values from one of the
   * provided generators.
   *
   *     var numOrBool = gen.oneOf([gen.int, gen.boolean])
   *
   */
  oneOf: <T>(generators: Array<Generator<T> | T>) => Generator<T>;

  /**
   * Similar to `oneOf`, except provides probablistic "weights" to
   * each generator.
   *
   *     var numOrRarelyBool = gen.oneOf([[99, gen.int], [1, gen.boolean]])
   */
  oneOfWeighted: <T>(
    generators: Array<[ number, Generator<T> | T ]>
  ) => Generator<T>;

  /**
   * Creates a Generator which will always generate the provided value.
   *
   *     var alwaysBlue = gen.return('blue');
   *
   */
  return: <T>(value: T) => Generator<T>;

  /**
   * Creates a Generator that relies on a size. Size allows for the "shrinking"
   * of Generators. Larger "size" should result in a larger generated value.
   *
   * For example, `gen.int` is shrinkable because it is implemented as:
   *
   *     var gen.int = gen.sized(size => gen.intWithin(-size, size))
   *
   */
  sized: <T>(sizedGenFn: (size: number) => Generator<T>) => Generator<T>;

}

/**
 * Options to be passed to array() or object()
 */
interface SizeOptions {
  /**
   * If provided, the exact size of the resulting collection.
   */
  size?: number,

  /**
   * If provided, the minimum size of the resulting collection.
   */
  minSize?: number,

  /**
   * If provided, the maximum size of the resulting collection.
   */
  maxSize?: number,
}
