require('../mocha-check').install();
var assert = require('assert');

describe('check', function () {

  it('was installed correctly', function () {
    assert(typeof check.it === 'function');
  })

  check.it('generates', [gen.int, gen.string], function(x, y) {
    assert(typeof x === 'number');
    assert(typeof y === 'string');
  })

  it('can use check as a spec wrapper', check([gen.posInt], function(x) {
    assert(x >= 0);
  }))

  check.it('generates with options', {times: 10}, [gen.posInt], function(x) {
    assert(x >= 0);
  })

  check.specify('specify can be used as alias for it', [gen.int], function (x) {
    assert(typeof x === 'number');
  })

});
