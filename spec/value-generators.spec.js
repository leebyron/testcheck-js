describe('value generators', function () {

  var tc = require('../').testcheck;

  it('generate ints', function () {
    var ints = tc.sample(tc.genInt, 100);
    expect(ints.length).toBe(100);
    expect(ints.every(function (value) {
      return Math.floor(value) === value && !isNaN(value);
    })).toBe(true);
  });

});
