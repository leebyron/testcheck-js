// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare function beforeEach(fn: () => void): void; */
/*:: declare var jasmine: any; */

const { gen, sample, sampleOne } = require('../')

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
    const vals = sample(gen.NaN, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return isNaN(value) && value !== value
    })
  })

  it('generates undefined', () => {
    const vals = sample(gen.undefined, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === undefined && value === value
    })
  })

  it('generates null', () => {
    const vals = sample(gen.null, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === null && value === value
    })
  })

  it('generates booleans', () => {
    const vals = sample(gen.boolean, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return (value === true || value === false) && value === value
    })
  })

  it('generates numbers', () => {
    const vals = sample(gen.number, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number'
    })
  })

  it('generates numbers', () => {
    const vals = sample(gen.number, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number'
    })
  })

  it('generates positive numbers', () => {
    const vals = sample(gen.posNumber, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value >= 0
    })
  })

  it('generates negative numbers', () => {
    const vals = sample(gen.negNumber, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value <= 0
    })
  })

  it('generates numbers in a range', () => {
    const vals = sample(gen.numberWithin(-100, 100), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && value >= -100 && value <= 100
    })
  })

  it('generates positive ints', () => {
    const vals = sample(gen.posInt, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value >= 0
    })
  })

  it('generates negative ints', () => {
    const vals = sample(gen.negInt, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value <= 0
    })
  })

  it('generates strictly positive ints', () => {
    const vals = sample(gen.sPosInt, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value > 0
    })
  })

  it('generates strictly negative ints', () => {
    const vals = sample(gen.sNegInt, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) && value < 0
    })
  })

  it('generates ints in a range', () => {
    const vals = sample(gen.intWithin(100, 200), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200
    })
  })

  it('generates strings', () => {
    const vals = sample(gen.string, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value
    })
  })

  const ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/

  it('generates alphanum strings', () => {
    const vals = sample(gen.alphaNumString, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value)
    })
  })

  it('generates substrings', () => {
    const original = 'abracadabda'
    const vals = sample(gen.substring(original), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'string' && original.indexOf(value) !== -1
    })
  })

  it('generates JS primitives', () => {
    const vals = sample(gen.primitive, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return !Array.isArray(value) && !(value && value.constructor === Object)
    })
  })

  it('generates arrays', () => {
    const vals = sample(gen.array(gen.null), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(function (x) { return x === null; })
    })
  })

  it('generates arrays of a certain length', () => {
    const vals = sample(gen.array(gen.null, { size: 3 }), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 3 && value.every(function (x) { return x === null; })
    })
  })

  it('generates arrays within a length range', () => {
    const vals = sample(gen.array(gen.null, { minSize: 3, maxSize: 5 }), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(function (x) { return x === null; })
    })
  })

  it('generates arrays shapes from a specific definition', () => {
    const vals = sample(gen.shape([true, gen.return(false)]), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 2 && value[0] === true && value[1] === false
    })
  })

  it('generates larger tuples', () => {
    const vals = sample(gen.shape([gen.int, gen.char, gen.boolean]), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return Array.isArray(value) &&
        value.length === 3 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'string' &&
        typeof value[2] === 'boolean'
    })
  });

  it('generates unique arrays', () => {
    const vals = sample(gen.uniqueArray(gen.int), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(value =>
      Array.isArray(value) &&
      value.every(item => value.filter(item2 => item === item2).length === 1)
    )
  })

  it('generates unique arrays of a specific size', () => {
    const vals = sample(gen.uniqueArray(gen.int, { size: 3 }), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(value =>
      Array.isArray(value) &&
      value.length === 3 &&
      value.every(item => value.filter(item2 => item === item2).length === 1)
    )
  })

  it('generates unique arrays with custom unique function', () => {
    const uniqueFn = point => point.join()
    const genPoint = gen.shape([ gen.int, gen.int ])
    const genUniquePoints = gen.uniqueArray(genPoint, uniqueFn)

    const vals = sample(genUniquePoints, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(value =>
      Array.isArray(value) &&
      value.every(item => value.filter(item2 =>
        uniqueFn(item) === uniqueFn(item2)
      ).length === 1)
    )
  })

  it('generates objects', () => {
    const vals = sample(gen.object(gen.null), 50)
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

  it('generates objects of a specific size', () => {
    const vals = sample(gen.object(gen.null, { size: 10 }), 50)
    expect(vals.length).toBe(50)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length === 10 &&
        keys.every(function (key) {
          return typeof key === 'string' && value[key] === null
        })
    })
  })

  it('generates objects in a specific size range', () => {
    const vals = sample(gen.object(gen.null, { minSize: 3, maxSize: 6 }), 50)
    expect(vals.length).toBe(50)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length >= 3 &&
        keys.length <= 6 &&
        keys.every(function (key) {
          return typeof key === 'string' && value[key] === null
        })
    })
  })

  it('generates objects with specific keys', () => {
    const vals = sample(gen.object(gen.alphaNumString, gen.null), 50)
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

  it('generates objects with specific keys of a specific size', () => {
    const vals = sample(gen.object(gen.alphaNumString, gen.null, { size: 10 }), 50)
    expect(vals.length).toBe(50)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length === 10 &&
        keys.every(function (key) {
          return typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null
        })
    })
  })

  it('generates object shapes from a specific definition', () => {
    const vals = sample(gen.shape({t: true, f: gen.return(false)}), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      const keys = Object.keys(value)
      return value.constructor === Object &&
        keys.length === 2 && value.t === true && value.f === false
    })
  })

  it('generates nested collections', () => {
    const vals = sample(gen.nested(gen.array, gen.int), 20)
    expect(vals.length).toBe(20)
    function isNestedArrayOfInt(arrayOrInt) {
      return typeof arrayOrInt === 'number' ||
        (arrayOrInt.every && arrayOrInt.every(isNestedArrayOfInt))
    }
    expect(vals).toAllPass(isNestedArrayOfInt)
  })

  it('generates json primitives', () => {
    const vals = sample(gen.JSONPrimitive, 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      const jsonStr = JSON.stringify(value)
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr
    })
  })

  it('generates json values', () => {
    const vals = sample(gen.JSONValue, 10)
    expect(vals.length).toBe(10)
    expect(vals).toAllPass(function (value) {
      const jsonStr = JSON.stringify(value)
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr
    })
  })

  it('generates json objects', () => {
    const vals = sample(gen.JSON, 10)
    expect(vals.length).toBe(10)
    expect(vals).toAllPass(function (value) {
      const jsonStr = JSON.stringify(value)
      return JSON.stringify(JSON.parse(jsonStr)) === jsonStr
    })
  })

  it('generates shapes', () => {
    const genShape = gen.shape({
      clone: { x: 1, y: 2 },
      gen: { x: gen.int, y: gen.int },
      char: gen.alphaNumChar
    })

    const value1 = sampleOne(genShape)
    expect(value1.clone).toEqual({ x: 1, y: 2 })
    value1.clone.x = 987;
    expect(value1.clone).toEqual({ x: 987, y: 2 })
    expect(typeof value1.char).toBe('string');
    expect(typeof value1.gen.x).toBe('number');
    expect(typeof value1.gen.y).toBe('number');

    const value2 = sampleOne(genShape)
    expect(value2.clone).toEqual({ x: 1, y: 2 })
  })

  it('generates clones', () => {
    const value = { x: 1, y: 2 }
    const genClone = gen.clone(value)

    const value1 = sampleOne(genClone)
    expect(value1).not.toBe(value)
    expect(value1).toEqual({ x: 1, y: 2 })
    value1.x = 987;
    expect(value1).toEqual({ x: 987, y: 2 })

    const value2 = sampleOne(genClone)
    expect(value2).not.toBe(value1)
    expect(value2).toEqual({ x: 1, y: 2 })
  })

  it('generates references', () => {
    const value = { x: 1, y: 2 }
    const genRef = gen.return(value)

    const value1 = sampleOne(genRef)
    expect(value1).toBe(value)

    const value2 = sampleOne(genRef)
    expect(value2).toBe(value1)
  })

})
