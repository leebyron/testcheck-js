describe('value generator', function () {

  var tc = require('../');

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
          return 'Expected ' + JSON.stringify(failedValue) + ' to pass ' + predicate;
        };
        return pass;
      }
    })
  });

  it('generates NaN', function () {
    var sample = tc.sample(tc.genNaN, {times:100});
    expect(sample.length).toBe(100);
    expect(sample).toAllPass(function (value) {
      return isNaN(value) && value !== value;
    });
  });

  it('generates undefined', function () {
    var sample = tc.sample(tc.genUndefined, {times:100});
    expect(sample.length).toBe(100);
    expect(sample).toAllPass(function (value) {
      return value === undefined && value === value;
    });
  });

  it('generates null', function () {
    var sample = tc.sample(tc.genNull, {times:100});
    expect(sample.length).toBe(100);
    expect(sample).toAllPass(function (value) {
      return value === null && value === value;
    });
  });

  it('generates booleans', function () {
    var sample = tc.sample(tc.genBoolean, {times:100});
    expect(sample.length).toBe(100);
    expect(sample).toAllPass(function (value) {
      return (value === true || value === false) && value === value;
    });
  });

  it('generates ints', function () {
    var ints = tc.sample(tc.genInt, {times:100});
    expect(ints.length).toBe(100);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value);
    });
  });

  it('generates positive ints', function () {
    var ints = tc.sample(tc.genPosInt, {times:100});
    expect(ints.length).toBe(100);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 0;
    });
  });

  it('generates negative ints', function () {
    var ints = tc.sample(tc.genNegInt, {times:100});
    expect(ints.length).toBe(100);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value <= 0;
    });
  });

  it('generates strictly positive ints', function () {
    var ints = tc.sample(tc.genStrictPosInt, {times:100});
    expect(ints.length).toBe(100);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value > 0;
    });
  });

  it('generates strictly negative ints', function () {
    var ints = tc.sample(tc.genStrictNegInt, {times:100});
    expect(ints.length).toBe(100);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value < 0;
    });
  });

  it('generates ints in a range', function () {
    var ints = tc.sample(tc.genIntWithin(100, 200), {times:100});
    expect(ints.length).toBe(100);
    expect(ints).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200;
    });
  });

  it('generates strings', function () {
    var strs = tc.sample(tc.genString, {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value;
    });
  });

  var ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/;

  it('generates alphanum strings', function () {
    var strs = tc.sample(tc.genAlphaNumString, {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value);
    });
  });

  it('generates JS primitives', function () {
    var vals = tc.sample(tc.genPrimitive, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return !Array.isArray(value) && !(value && value.constructor === Object);
    });
  });

  it('generates arrays', function () {
    var strs = tc.sample(tc.genArray(tc.genNull), {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays of a certain length', function () {
    var strs = tc.sample(tc.genArray(tc.genNull, 3), {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 3 && value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays within a length range', function () {
    var strs = tc.sample(tc.genArray(tc.genNull, 3, 5), {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays from a specific definition', function () {
    var strs = tc.sample(tc.genArray([tc.genReturn(true), tc.genReturn(false)]), {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 2 && value[0] === true && value[1] === false
    });
  });

  it('generates objects', function () {
    var strs = tc.sample(tc.genObject(tc.genNull), {times: 50});
    expect(strs.length).toBe(50);
    expect(strs).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every(function (key) {
          return typeof key === 'string' && value[key] === null;
        });
    });
  });

  it('generates objects with alphanum keys', function () {
    var strs = tc.sample(tc.genObject(tc.genAlphaNumString, tc.genNull), {times: 50});
    expect(strs.length).toBe(50);
    expect(strs).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every(function (key) {
          return typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null;
        });
    });
  });

  it('generates objects from a specific definition', function () {
    var strs = tc.sample(tc.genObject({t: tc.genReturn(true), f: tc.genReturn(false)}), {times:100});
    expect(strs.length).toBe(100);
    expect(strs).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length === 2 && value.t === true && value.f === false;
    });
  });

});
