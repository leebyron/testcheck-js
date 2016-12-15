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
    var vals = testcheck.sample(gen.NaN, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return isNaN(value) && value !== value;
    });
  });

  it('generates undefined', function () {
    var vals = testcheck.sample(gen.undefined, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return value === undefined && value === value;
    });
  });

  it('generates null', function () {
    var vals = testcheck.sample(gen.null, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return value === null && value === value;
    });
  });

  it('generates booleans', function () {
    var vals = testcheck.sample(gen.boolean, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return (value === true || value === false) && value === value;
    });
  });

  it('generates numbers', function () {
    var vals = testcheck.sample(gen.number, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number'
    });
  });

  it('generates numbers', function () {
    var vals = testcheck.sample(gen.number, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number'
    });
  });

  it('generates positive numbers', function () {
    var vals = testcheck.sample(gen.posNumber, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value >= 0
    });
  });

  it('generates negative numbers', function () {
    var vals = testcheck.sample(gen.negNumber, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value <= 0
    });
  });

  it('generates numbers in a range', function () {
    var vals = testcheck.sample(gen.numberWithin(-100, 100), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value >= -100 && value <= 100
    });
  });

  it('generates positive ints', function () {
    var vals = testcheck.sample(gen.posInt, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 0;
    });
  });

  it('generates negative ints', function () {
    var vals = testcheck.sample(gen.negInt, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value <= 0;
    });
  });

  it('generates strictly positive ints', function () {
    var vals = testcheck.sample(gen.strictPosInt, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value > 0;
    });
  });

  it('generates strictly negative ints', function () {
    var vals = testcheck.sample(gen.strictNegInt, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value < 0;
    });
  });

  it('generates ints in a range', function () {
    var vals = testcheck.sample(gen.intWithin(100, 200), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200;
    });
  });

  it('generates strings', function () {
    var vals = testcheck.sample(gen.string, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value;
    });
  });

  var ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/;

  it('generates alphanum strings', function () {
    var vals = testcheck.sample(gen.alphaNumString, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value);
    });
  });

  it('generates JS primitives', function () {
    var vals = testcheck.sample(gen.primitive, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return !Array.isArray(value) && !(value && value.constructor === Object);
    });
  });

  it('generates arrays', function () {
    var vals = testcheck.sample(gen.array(gen.null), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays of a certain length', function () {
    var vals = testcheck.sample(gen.array(gen.null, 3), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 3 && value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays within a length range', function () {
    var vals = testcheck.sample(gen.array(gen.null, 3, 5), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(function (x) { return x === null; });
    });
  });

  it('generates arrays from a specific definition', function () {
    var vals = testcheck.sample(gen.array([gen.return(true), gen.return(false)]), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 2 && value[0] === true && value[1] === false
    });
  });

  it('generates objects', function () {
    var vals = testcheck.sample(gen.object(gen.null), 50);
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
    var vals = testcheck.sample(gen.object(gen.alphaNumString, gen.null), 50);
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
    var vals = testcheck.sample(gen.object({t: gen.return(true), f: gen.return(false)}), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      var keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length === 2 && value.t === true && value.f === false;
    });
  });

  it('generates nested collections', function () {
    var vals = testcheck.sample(gen.nested(gen.array, gen.int), 20);
    expect(vals.length).toBe(20);
    function isNestedArrayOfInt(arrayOrInt) {
      return typeof arrayOrInt === 'number' ||
        (arrayOrInt.every && arrayOrInt.every(isNestedArrayOfInt));
    }
    expect(vals).toAllPass(isNestedArrayOfInt);
  });

  it('generates json primitives', function () {
    var vals = testcheck.sample(gen.JSONPrimitive, 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      var jsonStr = JSON.stringify(value);
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr;
    });
  });

  it('generates json values', function () {
    var vals = testcheck.sample(gen.JSONValue, 10);
    expect(vals.length).toBe(10);
    expect(vals).toAllPass(function (value) {
      var jsonStr = JSON.stringify(value);
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr;
    });
  });

  it('generates json objects', function () {
    var vals = testcheck.sample(gen.JSON, 10);
    expect(vals.length).toBe(10);
    expect(vals).toAllPass(function (value) {
      var jsonStr = JSON.stringify(value);
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr;
    });
  });

});
