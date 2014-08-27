declare module 'testcheck' {

  /**
   * Optional arguments to `check` and `sample`.
   */
  export interface Options {

    // Number of times to run `check` or `sample`.
    times?: number;

    // The maximum "size" to provide to sized generators. Default: 200
    maxSize?: number;

    // The seed to use for the random number generator. Default: Random
    seed?: number;
  }

  /**
   * The result of running `check`.
   */
  export interface Result {

    // True of the check passed.
    result: boolean;

    // The number of generated checks ran.
    'num-tests': number;

    // The seed used for this check.
    seed?: number;

    // The arguments generated when and if this check failed.
    fail?: Array<any>;

    // The size used when and if this check failed
    'failing-size'?: number;

    /**
     * When a check fails, the failing arguments shrink to find the smallest
     * value that fails.
     */
    shrunk?: {
      // True if the check passed, otherwise false.
      result: boolean;

      // The smallest arguments with this result.
      smallest: Array<any>;

      // The depth of the shrunk result.
      depth: number;

      // The number of nodes shrunk to result in this smallest failing value.
      'total-nodes-visited': number;
    }
  }

  /**
   * Generators of values.
   *
   * Generator is an opaque type. It has no public methods or properties.
   */
  export interface Generator<T> {}


  /**
   * Given a property to check, return the result of the check.
   *
   * A "property" is a Generator of booleans which should always generate true.
   * If the property generates a false value, check will shrink the generator
   * and return a Result which includes the `shrunk` key.
   *
   * If no options are provided, they default to:
   *
   *     {times: 100, maxSize: 200, seed: <Random>}
   *
   */
  export function check(property: Generator<boolean>, options?: Options): Result;

  /**
   * Creates a "property" as needed by `check`.
   *
   * Accepts an array of value generators, the results of which become the
   * arguments of the property function. The property function should return
   * true if the property is upheld, or false if it fails.
   *
   *     var numGoUp = property([gen.int, gen.posInt], (a, b) => a + b > a);
   *     check(numGoUp, {times: 1000});
   *
   */
  export function property(
    argGens: Array<Generator<any>>,
    propertyFn: (...args: any[]) => boolean
  ): Generator<boolean>;

  /**
   * Handy tool for checking the output of your generators. Given a generator,
   * it returns an array of the results of the generator.
   *
   *     var results = sample(gen.int, { seed: 123 });
   *     // [ 0, 1, 1, 2, 3, 3, -6, 1, -3, -8 ]
   *
   * If no options are provided, they default to:
   *
   *     {times: 10, maxSize: 200, seed: <Random>}
   *
   */
  export function sample<T>(gen: Generator<T>, options?: Options): Array<T>;


  // Generator Builders
  // ------------------

  export var gen: {

    /**
     * Creates a new Generator which ensures that all values Generated adhere to
     * the given `predicate`.
     *
     * Care is needed to ensure there is a high chance the predicate will pass.
     * By default, `suchThat` will try 10 times to generate a satisfactory
     * value. If no value adheres to the predicate, an exception will throw. You
     * can pass an optional third argument to change the number of times tried.
     * Note that each retry will increase the size of the generator.
     */
    suchThat: <T>(
      predicate: (value: T) => boolean,
      generator: Generator<T>,
      maxTries?: number // default 10
    ) => Generator<T>;

    /**
     * Creates a new Generator of collections (Arrays or Objects) which are
     * not empty.
     */
    notEmpty: <T>(
      generator: Generator<T>,
      maxTries?: number
    ) => Generator<T>;

    /**
     * Creates a new Generator which is the mapped result of another generator.
     *
     *     var genSquares = gen.map(n => n * n, gen.posInt);
     *
     */
    map: <T, S>(
      mapper: (value: T) => S,
      generator: Generator<T>
    ) => Generator<S>;

    /**
     * Creates a new Generator which passes the result of `generator` into the
     * `binder` function which should return a new Generator. This allows you to
     * create new Generators that depend on the values of other Generators.
     * For example, to create a Generator which first generates an array of
     * integers, and then chooses a random element from that array:
     *
     *     gen.bind(gen.notEmpty(gen.array(gen.int))), gen.returnOneOf)
     *
     */
    bind: <T, S>(
      generator: Generator<T>,
      binder: (value: T) => Generator<S>
    ) => Generator<S>;

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

    /**
     * Given an explicit size, and a Generator that relies on size, returns a new
     * Generator which always uses the provided size and is not shrinkable.
     */
    resized: <T>(size: number, generator: Generator<T>) => Generator<T>;

    /**
     * Given a shrinkable Generator, return a new Generator which will never
     * shrink. This can be useful when shrinking is taking a long time or is not
     * applicable to the domain.
     */
    noShrink: <T>(generator: Generator<T>) => Generator<T>;

    /**
     * Given a shrinkable Generator, return a new Generator which will always
     * consider shrinking, even if the property passes (up to one
     * additional level).
     */
    shrink: <T>(generator: Generator<T>) => Generator<T>;


    // Simple Generators
    // -----------------

    /**
     * Creates a Generator which will always generate the provided value.
     *
     *     var alwaysThree = gen.return(3);
     *
     */
    return: <T>(value: T) => Generator<T>;

    /**
     * Creates a Generator which will always generate one of the provided values.
     *
     *     var alphabetSoup = gen.returnOneOf(['a', 'b', 'c']);
     *
     */
    returnOneOf: <T>(values: T[]) => Generator<T>;

    /**
     * Creates a Generator which will generate values from one of the
     * provided generators.
     *
     *     var numOrBool = gen.oneOf([gen.int, gen.boolean])
     *
     */
    oneOf: <T>(generators: Generator<T>[]) => Generator<T>;

    /**
     * Similar to `oneOf`, except provides probablistic "weights" to
     * each generator.
     *
     *     var numOrRarelyBool = gen.oneOf([[99, gen.int], [1, gen.boolean]])
     */
    oneOfWeighted: <T>(
      generators: Array</*number, Generator<T>*/any>[]
    ) => Generator<T>;

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


    // Collections: Arrays and Objects
    // -------------------------------

    /**
     * Generates Arrays of values. There are a few forms `gen.array` can be used:
     *
     *  - Generate Arrays of random lengths (ex. arrays of integers)
     *
     *     gen.array(gen.int)
     *
     *  - Generate Arrays of specific lengths (ex. length of 5)
     *
     *     gen.array(gen.int, 5)
     *
     *  - Generate Arrays of random lengths within a specific range
     *    (ex. between 2 and 10)
     *
     *     gen.array(gen.int, 2, 10)
     *
     *  - Generate Arrays of specific lengths with different kinds of values at
     *    each index (e.g. tuples). (ex. tuples of [int, bool] like `[3, true]`)
     *
     *     gen.array([ gen.int, gen.boolean ])
     *
     */
    array: {
      <T>(valueGen: Generator<T>): Generator<Array<T>>;
      <T>(valueGen: Generator<T>, length: number): Generator<Array<T>>;
      <T>(valueGen: Generator<T>, min: number, max: number): Generator<Array<T>>;
      (genTuple: Array<Generator<any>>): Generator<Array<any>>;
    }

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
      <T>(valueGen: Generator<T>): Generator<{[key: string]: T}>;
      <T>(keyGen: Generator<string>, valueGen: Generator<T>): Generator<{[key: string]: T}>;
      (genMap: {[key: string]: Generator<any>}): Generator<{[key: string]: any}>;
    }

    /**
     * Generates either an Array or an Object with values of the provided kind.
     */
    arrayOrObject: <T>(
      valueGen: Generator<T>
    ) => Generator<{[key: string]: T; [key: number]: T}>;


    // JS Primitives
    // -------------

    NaN: Generator<number>;
    undefined: Generator<void>;
    null: Generator<void>;
    boolean: Generator<boolean>;

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


    // JSON

    /**
     * Generates JSON primitives: strings, numbers, booleans and null.
     */
    JSONPrimitive: Generator<any>;

    /**
     * Generates JSON values: primitives, or (possibly nested) arrays or objects.
     */
    JSONValue: Generator<any>;

    /**
     * Generates JSON objects where each key is a JSON value.
     */
    JSON: Generator<{[key: string]: any}>;


    // JS
    // --

    /**
     * Generates any primitive JS value:
     * strings, numbers, booleans, null, undefined, or NaN.
     */
    primitive: Generator<any>;

    /**
     * Generates any JS value (possibly nested).
     */
    any: Generator<any>;

  }
}
