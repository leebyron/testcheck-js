///<reference path='dist/testcheck.d.ts'/>
import tc = require('testcheck');

declare function require(module: string): any;
var util = require('util');


console.log(tc.sample(tc.genPrimitive, {maxSize:100000}));


console.log(util.inspect(


  tc.check(tc.property(
      [tc.genObject({
        numbers: tc.genSuchThat<Array<number>>(
          array => array.length >= 2,
          tc.genArray(tc.genInt)
        )
      })],
      val => val.numbers[1] < 1000000
    ),
    {times:undefined, maxSize:undefined, seed: undefined}
  )

  ,{depth:10}
))










// console.log(
//   tc.quickCheck(
//     1000,
//     tc.forAll(
//       [
//         tc.genInt,
//         tc.genTuple(
//           tc.genPrimitive,
//           tc.genInt,
//           tc.genBoolean
//         ),
//         tc.genMap({
//           int: tc.genInt,
//           bool: tc.genBoolean
//         }),
//         tc.genNotEmpty(tc.genObject(tc.genInt)),
//       ],
//       function(val) {
//         console.log(arguments);
//         return val != 41;
//       }
//     )
//   )
// )



/*

expect(function(x) {x === x}).toAcceptAny(Number)

expect(function(x) {x === x}).toAcceptAny(String)

expect(function(x) {x === x}).toAcceptAny(Object)

expect(function(x) {x === x}).toAcceptAny(Array)

expect(function(x) {x === x}).toAcceptAny([Number, Number])

expect(function(x) {x === x}).toAcceptAny({x:Number, y:Number})


*/
