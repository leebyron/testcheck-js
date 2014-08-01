var util = require('util');
var tc = require('./');


console.log(util.inspect(


  tc.check(
    1000,
    tc.forAll(
      [
        tc.genObject({
          numbers: tc.genSuchThat(function(array){return array.length >= 2}, tc.genArray(tc.genInt))
        })
      ],
      function(val) {
        return val.numbers[1] < 42;
      }
    )
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
