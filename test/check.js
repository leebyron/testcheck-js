require('../mocha-check').install();
var assert = require('assert');

describe('check', function () {

  it('was installed correctly', function () {
    assert(typeof check.it === 'function');
  })

  // check.it('generates', [gen.int, gen.string], function(x, y) {
  //   assert(typeof x === 'number');
  //   assert(typeof y === 'string');
  // })

  // check.it('generates with options', {times: 100}, [gen.strictPosInt], function(x) {
  //   assert(x > 0);
  // })

});
