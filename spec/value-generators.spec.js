describe('value generator', function () {

  var tc = require('../').testcheck;

  beforeEach(function () {
    this.addMatchers({
      toAllPass: function(predicate) {
        var failedValue;
        var pass = this.actual.every(function (value) {
          if (predicate(value)) {
            return true;
          } else {
            failedValue = value;
          }
        });
        this.message = function() {
          return 'Expected ' + failedValue + ' to pass ' + predicate;
        };
        return pass;
      }
    })
  });

  it('generates NaN', function () {
    var sample = tc.sample(tc.genNaN, 1000);
    expect(sample.length).toBe(1000);
    expect(sample).toAllPass(function (value) {
      return isNaN(value) && value !== value;
    });
  });

  it('generates undefined', function () {
    var sample = tc.sample(tc.genUndefined, 1000);
    expect(sample.length).toBe(1000);
    expect(sample).toAllPass(function (value) {
      return value === undefined && value === value;
    });
  });

  it('generates null', function () {
    var sample = tc.sample(tc.genNull, 1000);
    expect(sample.length).toBe(1000);
    expect(sample).toAllPass(function (value) {
      return value === null && value === value;
    });
  });

  it('generates booleans', function () {
    var sample = tc.sample(tc.genBoolean, 1000);
    expect(sample.length).toBe(1000);
    expect(sample).toAllPass(function (value) {
      return (value === true || value === false) && value === value;
    });
  });

  it('generates ints', function () {
    var ints = tc.sample(tc.genInt, 1000);
    expect(ints.length).toBe(1000);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value);
    });
  });

  it('generates positive ints', function () {
    var ints = tc.sample(tc.genPosInt, 1000);
    expect(ints.length).toBe(1000);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 0;
    });
  });

  it('generates negative ints', function () {
    var ints = tc.sample(tc.genNegInt, 1000);
    expect(ints.length).toBe(1000);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value <= 0;
    });
  });

  it('generates strictly positive ints', function () {
    var ints = tc.sample(tc.genStrictPosInt, 1000);
    expect(ints.length).toBe(1000);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value > 0;
    });
  });

  it('generates strictly negative ints', function () {
    var ints = tc.sample(tc.genStrictNegInt, 1000);
    expect(ints.length).toBe(1000);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value < 0;
    });
  });

  it('generates ints in a range', function () {
    var ints = tc.sample(tc.genIntWithin(100, 200), 1000);
    expect(ints.length).toBe(1000);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 100 && value <= 200;
    });
  });

});
