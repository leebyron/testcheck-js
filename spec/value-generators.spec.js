describe('value generator', function () {

  var testcheck = require('../');
  var gen = testcheck.gen;

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
    var vals = testcheck.sample(gen.NaN, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return isNaN(value) && value !== value;
    });
  });

  it('generates undefined', function () {
    var vals = testcheck.sample(gen.undefined, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return value === undefined && value === value;
    });
  });

  it('generates null', function () {
    var vals = testcheck.sample(gen.null, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return value === null && value === value;
    });
  });

  it('generates booleans', function () {
    var vals = testcheck.sample(gen.boolean, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return (value === true || value === false) && value === value;
    });
  });

  it('generates ints', function () {
    var vals = testcheck.sample(gen.int, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value);
    });
  });

  it('generates positive ints', function () {
    var vals = testcheck.sample(gen.posInt, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 0;
    });
  });

  it('generates negative ints', function () {
    var vals = testcheck.sample(gen.negInt, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value <= 0;
    });
  });

  it('generates strictly positive ints', function () {
    var vals = testcheck.sample(gen.strictPosInt, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value > 0;
    });
  });

  it('generates strictly negative ints', function () {
    var vals = testcheck.sample(gen.strictNegInt, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value < 0;
    });
  });

  it('generates ints in a range', function () {
    var vals = testcheck.sample(gen.intWithin(100, 200), {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200;
    });
  });

  it('generates strings', function () {
    var vals = testcheck.sample(gen.string, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value;
    });
  });

  var ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/;

  it('generates alphanum strings', function () {
    var vals = testcheck.sample(gen.alphaNumString, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value);
    });
  });

  it('generates JS primitives', function () {
    var vals = testcheck.sample(gen.primitive, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return !Array.isArray(value) && !(value && value.constructor === Object);
    });
  });

  it('generates arrays', function () {
    var vals = testcheck.sample(gen.array(gen.null), {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays of a certain length', function () {
    var vals = testcheck.sample(gen.array(gen.null, 3), {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 3 && value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays within a length range', function () {
    var vals = testcheck.sample(gen.array(gen.null, 3, 5), {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays from a specific definition', function () {
    var vals = testcheck.sample(gen.array([gen.return(true), gen.return(false)]), {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 2 && value[0] === true && value[1] === false
    });
  });

  it('generates objects', function () {
    var vals = testcheck.sample(gen.object(gen.null), {times: 50});
    expect(vals.length).toBe(50);
    expect(vals).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every(function (key) {
          return typeof key === 'string' && value[key] === null;
        });
    });
  });

  it('generates objects with alphanum keys', function () {
    var vals = testcheck.sample(gen.object(gen.alphaNumString, gen.null), {times: 50});
    expect(vals.length).toBe(50);
    expect(vals).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every(function (key) {
          return typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null;
        });
    });
  });

  it('generates objects from a specific definition', function () {
    var vals = testcheck.sample(gen.object({t: gen.return(true), f: gen.return(false)}), {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length === 2 && value.t === true && value.f === false;
    });
  });

  it('generates json primitives', function () {
    var vals = testcheck.sample(gen.JSONPrimitive, {times:100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      var jsonStr = JSON.stringify(value);
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr;
    });
  });

  it('generates json values', function () {
    var vals = testcheck.sample(gen.JSONValue, {times:10});
    expect(vals.length).toBe(10);
    expect(vals).toAllPass(function (value) {
      var jsonStr = JSON.stringify(value);
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr;
    });
  });

  it('generates json objects', function () {
    var vals = testcheck.sample(gen.JSON, {times:10});
    expect(vals.length).toBe(10);
    expect(vals).toAllPass(function (value) {
      var jsonStr = JSON.stringify(value);
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr;
    });
  });

});
