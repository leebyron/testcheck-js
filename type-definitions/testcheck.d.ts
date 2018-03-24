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

/**
 * ValueGenerators of values.
 */
export class ValueGenerator<T> {

  /**
   * Creates a new ValueGenerator which also sometimes generates null values.
   */
  nullable(): ValueGenerator<T | null>;

  /**
   * Creates a new ValueGenerator which generates non-empty values.
   *
   * Examples of empty values are 0, "", null, [], and {}
   */
  notEmpty(): ValueGenerator<T>;

  /**
   * Creates a new ValueGenerator which ensures that all values generated adhere to
   * the given predicate function.
   *
   * For example, to create a ValueGenerator of any number except multiples of 5:
   *
   *     var genAnythingBut5s = gen.int.suchThat(n => n % 5 !== 0);
   *
   * Note: Care is needed to ensure there is a high chance the predicate will
   * pass, after ten attempts, an exception will throw.
   */
  suchThat(fn: (value: T) => boolean): ValueGenerator<T>;

  /**
   * Creates a new ValueGenerator that depends on the values of this ValueGenerator.
   *
   * For example, to create a ValueGenerator of square numbers:
   *
   *     var genSquares = gen.int.then(n => n * n);
   *
   * For example, to create a ValueGenerator which first generates an array of
   * integers, and then returns both that array and a sampled value from it:
   *
   *     var genList = gen.notEmpty(gen.array(gen.int))
   *     var genListAndItem = genList.then(
   *       list => gen.array([ list, gen.oneOf(list) ])
   *     );
   *
   */
  then<U>(fn: (value: T) => ValueGenerator<U> | U): ValueGenerator<U>;

  /**
   * Creates a new ValueGenerator which grows at a different scale.
   *
   * ValueGenerators start by producing very "small" values (closer to 0) at first,
   * and produce larger values in later iterations of a test as a result of a
   * "size" value which grows with each generation. Typically "size" grows
   * linearly, but .scale() can alter a size to grow at different rates.
   *
   * For example, to generate "big" numbers that grow super-linearly (cubicly):
   *
   *      var bigInts = gen.int.scale(n => n * n * n)
   *      console.log(sample(bigInts))
   *      // [ 0, 1, 5, 0, -59, -56, -160, 261, 409, -34 ]
   *
   * Note: When shrinking a failing test, "size" gets smaller. If the scale
   * function returns a value that's not dependent on it's input, then the
   * resulting ValueGenerator will not shrink.
   */
  scale(fn: (size: number) => number): ValueGenerator<T>;

  /**
   * Creates a new ValueGenerator which will never shrink.
   * This is useful when shrinking is taking a long time or is not applicable.
   */
  neverShrink(): ValueGenerator<T>;

  /**
   * Creates a new ValueGenerator which will always consider shrinking, even if the
   * property passes (up to one additional level).
   */
  alwaysShrink(): ValueGenerator<T>;
}


/**
 * Properties created by property()
 */
export interface Property<TArgs> {}

/**
 * The options accepted by check()
 */
export interface CheckOptions {

  // Number of times to run `check`.
  numTests?: number,

  // The maximum "size" to provide to sized generators. Default: 200
  maxSize?: number,

  // The seed to use for the random number generator. Default: Random
  seed?: number,
}

/**
 * Given a property to check, return the result of the check.
 *
 * If the property generates a false value, check will shrink the generator
 * and return a Result which includes the `shrunk` key.
 *
 * If no options are provided, they default to:
 *
 *     {numTests: 100, maxSize: 200, seed: <Random>}
 *
 */
export function check<TArgs>(property: Property<TArgs>, options?: CheckOptions): {

  // True if the check passed, otherwise false or a thrown Error.
  result: boolean | Error,

  // The number of generated checks ran.
  numTests: number,

  // The seed used for this check.
  seed?: number,

  // The arguments generated when and if this check failed.
  fail?: TArgs,

  // The size used when and if this check failed
  failingSize?: number,

  /**
   * When a check fails, the failing arguments shrink to find the smallest
   * value that fails.
   */
  shrunk?: {
    // True if the check passed, otherwise false or a thrown Error.
    result: boolean | Error,

    // The smallest arguments with this result.
    smallest: TArgs,

    // The depth of the shrunk result.
    depth: number,

    // The number of nodes shrunk to result in this smallest failing value.
    totalNodesVisited: number,
  }
};


/**
 * Creates a "property" as needed by `check`.
 *
 * Accepts any number of value generators, the results of which become the
 * arguments of the property function. The property function should return
 * true if the property is upheld, or false if it fails.
 *
 *     var numGoUp = property(gen.int, gen.posInt, (a, b) => a + b > a);
 *     check(numGoUp, {times: 1000});
 *
 */
export function property<A>(
  genA: ValueGenerator<A>,
  f: (a: A) => boolean | void
): Property<[A]>;
export function property<A,B>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  f: (a: A, b: B) => boolean | void
): Property<[A, B]>;
export function property<A,B,C>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  f: (a: A, b: B, c: C) => boolean | void
): Property<[A, B, C]>;
export function property<A,B,C,D>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  f: (a: A, b: B, c: C, d: D) => boolean | void
): Property<[A, B, C, D]>;
export function property<A,B,C,D,E>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  genE: ValueGenerator<E>,
  f: (a: A, b: B, c: C, d: D, e: E) => boolean | void
): Property<[A, B, C, D, E]>;

/**
 * Handy tool for checking the output of your generators. Given a generator,
 * it returns an array of the results of the generator.
 *
 *     var results = sample(gen.int);
 *     // [ 0, 1, 1, 2, 3, 3, -6, 1, -3, -8 ]
 *
 * By default 10 samples are provided unless otherwise specified.
 *
 */
export function sample<T>(gen: ValueGenerator<T>, numValues?: number): Array<T>;

/**
 * Handy tool for visualizing the output of your ValueGenerator.
 *
 * Given a ValueGenerator, it returns a single value generated for a given `size`.
 *
 *     sampleOne(gen.int)
 *     // 24
 *
 * By default, values of size 30 are produced.
 */
export function sampleOne<T>(gen: ValueGenerator<T>, size?: number): T;



// ValueGenerator Builders
// ------------------

export const gen: {

  // JS Primitives
  // -------------

  /**
   * Generates any JS value, including Arrays and Objects (possibly nested).
   */
  any: ValueGenerator<any>;

  /**
   * Generates any primitive JS value:
   * strings, numbers, booleans, null, undefined, or NaN.
   */
  primitive: ValueGenerator<string | number | boolean | null | undefined>;

  boolean: ValueGenerator<boolean>;
  null: ValueGenerator<null>;
  undefined: ValueGenerator<undefined>;
  NaN: ValueGenerator<number>;

  // Numbers
  // -------

  /**
   * Generates floating point numbers (including +Infinity, -Infinity, and NaN).
   */
  number: ValueGenerator<number>;

  /**
   * Generates only positive numbers (0 though +Infinity), does not generate NaN.
   */
  posNumber: ValueGenerator<number>;

  /**
   * Generates only negative numbers (0 though -Infinity), does not generate NaN.
   */
  negNumber: ValueGenerator<number>;

  /**
   * Generates a floating point number within the provided (inclusive) range.
   * Does not generate NaN or +-Infinity.
   */
  numberWithin: (min: number, max: number) => ValueGenerator<number>;

  /**
   * ValueGenerator integers (32-bit signed) including negative numbers and 0.
   */
  int: ValueGenerator<number>;

  /**
   * Generates positive integers, including 0.
   */
  posInt: ValueGenerator<number>;

  /**
   * Generates negative integers, including 0.
   */
  negInt: ValueGenerator<number>;

  /**
   * Generates only strictly positive integers, not including 0.
   */
  sPosInt: ValueGenerator<number>;

  /**
   * Generates only strictly negative integers, not including 0.
   */
  sNegInt: ValueGenerator<number>;

  /**
   * Generates an integer within the provided (inclusive) range.
   * The resulting ValueGenerator is not shrinkable.
   */
  intWithin: (min: number, max: number) => ValueGenerator<number>;


  // Strings
  // -------

  /**
   * Generates strings of arbitrary characters.
   *
   * Note: strings of arbitrary characters may result in higher-plane Unicode
   * characters and non-printable characters.
   */
  string: ValueGenerator<string>;

  /**
   * Generates strings of printable ascii characters.
   */
  asciiString: ValueGenerator<string>;

  /**
   * Generates strings of only alpha-numeric characters: a-z, A-Z, 0-9.
   */
  alphaNumString: ValueGenerator<string>;

  /**
   * Generates substrings of an original string (including the empty string).
   */
  substring: (original: string) => ValueGenerator<string>;

  /**
   * Generates arbitrary 1-byte characters (code 0 through 255).
   */
  char: ValueGenerator<string>;

  /**
   * Generates only printable ascii characters (code 32 through 126).
   */
  asciiChar: ValueGenerator<string>;

  /**
   * Generates only alpha-numeric characters: a-z, A-Z, 0-9.
   */
  alphaNumChar: ValueGenerator<string>;


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
    <T>(valueGen: ValueGenerator<T>): ValueGenerator<Array<T>>;
    <T>(valueGen: ValueGenerator<T>, options?: SizeOptions): ValueGenerator<Array<T>>;
    <T1, T2, T3, T4, T5>(tupleGens: [T1 | ValueGenerator<T1>, T2 | ValueGenerator<T2>, T3 | ValueGenerator<T3>, T4 | ValueGenerator<T4>, T5 | ValueGenerator<T5>]): ValueGenerator<[T1, T2, T3, T4, T5]>;
    <T1, T2, T3, T4>(tupleGens: [T1 | ValueGenerator<T1>, T2 | ValueGenerator<T2>, T3 | ValueGenerator<T3>, T4 | ValueGenerator<T4>]): ValueGenerator<[T1, T2, T3, T4]>;
    <T1, T2, T3>(tupleGens: [T1 | ValueGenerator<T1>, T2 | ValueGenerator<T2>, T3 | ValueGenerator<T3>]): ValueGenerator<[T1, T2, T3]>;
    <T1, T2>(tupleGens: [T1 | ValueGenerator<T1>, T2 | ValueGenerator<T2>]): ValueGenerator<[T1, T2]>;
    <T1>(tupleGens: [T1 | ValueGenerator<T1>]): ValueGenerator<[T1]>;
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
    <T>(valueGen: ValueGenerator<T>, options?: SizeOptions): ValueGenerator<Array<T>>;
    <T>(valueGen: ValueGenerator<T>, uniqueBy: (value: T) => any, options?: SizeOptions): ValueGenerator<Array<T>>;
  };

  /**
   * Generates Objects of values. There are a few forms `gen.object` can be used:
   *
   *  - Generate Objects with a specified kind of value and alpha-numeric keys.
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
    <T>(valueGen: ValueGenerator<T>, options?: SizeOptions): ValueGenerator<{[key: string]: T}>;
    <T>(keyGen: ValueGenerator<string>, valueGen: ValueGenerator<T>, options?: SizeOptions): ValueGenerator<{[key: string]: T}>;
    <T>(genMap: {[Key in keyof T]: ValueGenerator<T[Key]>}): ValueGenerator<T>;
  };

  /**
   * Generates either an Array or an Object with values of the provided kind.
   *
   * Note: Objects will be produced with alpha-numeric keys.
   */
  arrayOrObject: <T>(
    valueGen: ValueGenerator<T>
  ) => ValueGenerator<{[key: string]: T; [key: number]: T}>;

  /**
   * Given a function which takes a generator and returns a generator (such as
   * `gen.array` or `gen.object`), and a ValueGenerator to use as values, creates
   * potentially nested values.
   *
   *     gen.nested(gen.array, gen.int)
   *     // [ [ 0, [ -2 ], 1, [] ]
   *
   */
  nested: <C, T>(
    collectionGenFn: (valueGen: ValueGenerator<T>) => ValueGenerator<C>,
    valueGen: ValueGenerator<T>
  ) => ValueGenerator<C>;


  // JSON
  // ----

  /**
   * Generates JSON objects where each key is a JSON value.
   */
  JSON: ValueGenerator<{[key: string]: JSONValue}>;

  /**
   * Generates JSON values: primitives, or (possibly nested) arrays or objects.
   */
  JSONValue: ValueGenerator<JSONValue>;

  /**
   * Generates JSON primitives: strings, numbers, booleans and null.
   */
  JSONPrimitive: ValueGenerator<JSONPrimitive>;


  // ValueGenerator Creators
  // ------------------

  /**
   * Creates a ValueGenerator which will generate values from one of the
   * provided generators.
   *
   *     var numOrBool = gen.oneOf([gen.int, gen.boolean])
   *
   */
  oneOf: <T>(generators: Array<ValueGenerator<T> | T>) => ValueGenerator<T>;

  /**
   * Similar to `gen.oneOf()`, except provides probablistic "weights" to
   * each generator.
   *
   *     var numOrRarelyBool = gen.oneOfWeighted([[99, gen.int], [1, gen.boolean]])
   */
  oneOfWeighted: <T>(
    generators: Array<[ number, ValueGenerator<T> | T ]>
  ) => ValueGenerator<T>;

  /**
   * Creates a ValueGenerator which will always generate the provided value.
   *
   *     var alwaysBlue = gen.return('blue');
   *
   */
  return: <T>(value: T) => ValueGenerator<T>;

  /**
   * Creates a ValueGenerator that relies on a size. Size allows for the "shrinking"
   * of ValueGenerators. Larger "size" should result in a larger generated value.
   *
   * For example, `gen.int` is shrinkable because it is implemented as:
   *
   *     var gen.int = gen.sized(size => gen.intWithin(-size, size))
   *
   */
  sized: <T>(sizedGenFn: (size: number) => ValueGenerator<T> | T) => ValueGenerator<T>;

}

type JSONPrimitive = string | number | boolean | null;
interface JSONArray extends Array<JSONValue> { }
type JSONValue = JSONPrimitive | JSONArray | {[key: string]: JSONValue};
