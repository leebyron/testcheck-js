// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare function beforeEach(): void; */
/*:: declare var jasmine: any; */

const { gen } = require('../')

describe('value generator', () => {

  beforeEach(function () {
    this.addMatchers({
      toAllPass: function(predicate) {
        let failedValue
        const pass = this.actual.every(function (value) {
          if (predicate(value)) {
            return true
          } else {
            failedValue = value
          }
        })
        this.message = function() {
          return 'Expected ' + JSON.stringify(failedValue) + ' to pass ' + predicate
        }
        return pass
      }
    })
  })

  it('generates NaN', () => {
    const vals = gen.NaN.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return isNaN(value) && value !== value
    })
  })

  it('generates undefined', () => {
    const vals = gen.undefined.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === undefined && value === value
    })
  })

  it('generates null', () => {
    const vals = gen.null.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === null && value === value
    })
  })

  it('generates booleans', () => {
    const vals = gen.boolean.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return (value === true || value === false) && value === value
    })
  })

  it('generates numbers', () => {
    const vals = gen.number.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number'
    })
  })

  it('generates numbers', () => {
    const vals = gen.number.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number'
    })
  })

  it('generates positive numbers', () => {
    const vals = gen.posNumber.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value >= 0
    })
  })

  it('generates negative numbers', () => {
    const vals = gen.negNumber.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value <= 0
    })
  })

  it('generates numbers in a range', () => {
    const vals = gen.numberWithin(-100, 100).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value >= -100 && value <= 100
    })
  })

  it('generates positive ints', () => {
    const vals = gen.posInt.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 0
    })
  })

  it('generates negative ints', () => {
    const vals = gen.negInt.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value <= 0
    })
  })

  it('generates strictly positive ints', () => {
    const vals = gen.strictPosInt.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value > 0
    })
  })

  it('generates strictly negative ints', () => {
    const vals = gen.strictNegInt.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value < 0
    })
  })

  it('generates ints in a range', () => {
    const vals = gen.intWithin(100, 200).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200
    })
  })

  it('generates strings', () => {
    const vals = gen.string.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value
    })
  })

  const ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/

  it('generates alphanum strings', () => {
    const vals = gen.alphaNumString.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value)
    })
  })

  it('generates JS primitives', () => {
    const vals = gen.primitive.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return !Array.isArray(value) && !(value && value.constructor === Object)
    })
  })

  it('generates arrays', () => {
    const vals = gen.array(gen.null).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(function (x) { return x === null; })
    })
  })

  it('generates arrays of a certain length', () => {
    const vals = gen.array(gen.null, 3).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 3 && value.every(function (x) { return x === null; })
    })
  })

  it('generates arrays within a length range', () => {
    const vals = gen.array(gen.null, 3, 5).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(function (x) { return x === null; })
    })
  })

  it('generates arrays from a specific definition', () => {
    const vals = gen.array([gen.return(true), gen.return(false)]).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 2 && value[0] === true && value[1] === false
    })
  })

  it('generates objects', () => {
    const vals = gen.object(gen.null).sample(50)
    expect(vals.length).toBe(50)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every(function (key) {
          return typeof key === 'string' && value[key] === null
        })
    })
  })

  it('generates objects with alphanum keys', () => {
    const vals = gen.object(gen.alphaNumString, gen.null).sample(50)
    expect(vals.length).toBe(50)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every(function (key) {
          return typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null
        })
    })
  })

  it('generates objects from a specific definition', () => {
    const vals = gen.object({t: gen.return(true), f: gen.return(false)}).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length === 2 && value.t === true && value.f === false
    })
  })

  it('generates nested collections', () => {
    const vals = gen.nested(gen.array, gen.int).sample(20)
    expect(vals.length).toBe(20)
    function isNestedArrayOfInt(arrayOrInt) {
      return typeof arrayOrInt === 'number' ||
        (arrayOrInt.every && arrayOrInt.every(isNestedArrayOfInt))
    }
    expect(vals).toAllPass(isNestedArrayOfInt)
  })

  it('generates json primitives', () => {
    const vals = gen.JSONPrimitive.sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      const jsonStr = JSON.stringify(value)
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr
    })
  })

  it('generates json values', () => {
    const vals = gen.JSONValue.sample(10)
    expect(vals.length).toBe(10)
    expect(vals).toAllPass(function (value) {
      const jsonStr = JSON.stringify(value)
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr
    })
  })

  it('generates json objects', () => {
    const vals = gen.JSON.sample(10)
    expect(vals.length).toBe(10)
    expect(vals).toAllPass(function (value) {
      const jsonStr = JSON.stringify(value)
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr
    })
  })

})
