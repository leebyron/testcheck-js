import { check, property, gen, Generator } from '../'

// Test: single arg Error
check(property(
  gen.boolean,
  value =>
    // $ExpectError The operand of an arithmetic operation must be a number.
    value * 2 === 2
))

// Test: single arg ok
check(property(
  gen.number,
  value =>
    value * 2 === 2
))

// Test: multiple args Error
check(property(
  gen.string, gen.int,
  (aString, anInt) => {
    // $ExpectError cannot multiply a number and string
    return aString * anInt === 123
  }
))

// Test: multple args Ok
check(property(
  gen.number, gen.int,
  (aNumber, anInt) => {
    return aNumber * anInt === 123
  }
))

// Test: tuples Error
check(property(
  gen.array([ gen.string, gen.int ]),
  ([ aString, anInt ]) => {
    // $ExpectError cannot multiply a number and string
    return aString * anInt === 123
  }
))

// Test: tuples Ok
check(property(
  gen.array([ gen.number, gen.int ]),
  ([ aNumber, anInt ]) => {
    // Numbers can be multiplied
    return aNumber * anInt === 123
  }
))

// Test: normal arg + tuple arg Error
check(property(
  gen.number, gen.array([ gen.string, gen.int ]),
  (aNumber, [aString, anInt]) =>
    // $ExpectError cannot multiply a number and string
    aNumber * aString === 123
))

// Test: normal arg + tuple arg OK
check(property(
  gen.number, gen.array([ gen.string, gen.int ]),
  (number, array) =>
    // However numbers can be multiplied
    number * array[1] === 123
))

// Test: normal arg + tuple arg OK
check(property(
  gen.string, gen.array([ gen.string, gen.int ]),
  (string, array) =>
    // Strings can be uppercased and added
    string.toUpperCase() + array[0].toUpperCase() === 'ABCABC'
))

// Test: Object records Error
check(property(
  gen.object({ aString: gen.string, aNumber: gen.number }),
  ({ aString, aNumber }) =>
    // $ExpectError cannot multiply a number and string
    aString * aNumber === 123
))

// Test: Object records Ok
check(property(
  gen.object({ anInt: gen.int, aNumber: gen.number }),
  ({ anInt, aNumber }) =>
    // However numbers can be multiplied
    anInt * aNumber === 123
))

// Test: Options OK
check(
  property(
    gen.string,
    string => string + string === 'abcabc'
  ),
  // Ok to provide options to check
  { numTests: 1000 }
)

// Test: Options Typo
check(
  property(
    gen.string,
    string => string + string === 'abcabc'
  ),
  // $ExpectError catches mistyped options
  { numTimes: 1000 }
)

// Test: Object with some types ok
check(property(
  gen.object({ anInt: gen.int, anArrayOfInts: gen.array(gen.int) }),
  ({ anInt, anArrayOfInts }) =>
    // can do something typed with these arguments
    anArrayOfInts.concat([anInt]) === [1,2,3]
))

type Person = {
  name: string,
  age: number
}

// Test: Everything OK
const personGen = gen.object<Person>({
  name: gen.string,
  age: gen.number
});

// $ExpectError missing 'age' key in generator
gen.object<Person>({
  name: gen.string
});

// $ExpectError 'likesDancing' is not part of a person
gen.object<Person>({
  name: gen.string,
  age: gen.number,
  likesDancing: gen.boolean
});

type Parent = {
  child: Person
};

// Test: Works with composite generators
gen.object<Parent>({
  child: personGen
});

// $ExpectError child generator is not a Person
gen.object<Parent>({
  child: gen.object({
    name: gen.string
  })
});

// $ExpectError string is not a number
var test: Generator<{ name: number }> = gen.object({
  name: gen.string
});
