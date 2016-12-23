// @flow

const test = require('ava');
const { gen, sample } = require('../')

test('generates NaN', t => {
  const vals = sample(gen.NaN, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(isNaN(value) && value !== value)
  })
})

test('generates undefined', t => {
  const vals = sample(gen.undefined, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(value === undefined && value === value)
  })
})

test('generates null', t => {
  const vals = sample(gen.null, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(value === null && value === value)
  })
})

test('generates booleans', t => {
  const vals = sample(gen.boolean, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true((value === true || value === false) && value === value)
  })
})

test('generates numbers', t => {
  const vals = sample(gen.number, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'number')
  })
})

test('generates numbers', t => {
  const vals = sample(gen.number, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'number')
  })
})

test('generates positive numbers', t => {
  const vals = sample(gen.posNumber, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'number' && value >= 0)
  })
})

test('generates negative numbers', t => {
  const vals = sample(gen.negNumber, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'number' && value <= 0)
  })
})

test('generates numbers in a range', t => {
  const vals = sample(gen.numberWithin(-100, 100), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'number' && value >= -100 && value <= 100)
  })
})

test('generates positive ints', t => {
  const vals = sample(gen.posInt, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(Math.floor(value) === value && !isNaN(value) && value >= 0)
  })
})

test('generates negative ints', t => {
  const vals = sample(gen.negInt, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(Math.floor(value) === value && !isNaN(value) && value <= 0)
  })
})

test('generates strictly positive ints', t => {
  const vals = sample(gen.sPosInt, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(Math.floor(value) === value && !isNaN(value) && value > 0)
  })
})

test('generates strictly negative ints', t => {
  const vals = sample(gen.sNegInt, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(Math.floor(value) === value && !isNaN(value) && value < 0)
  })
})

test('generates ints in a range', t => {
  const vals = sample(gen.intWithin(100, 200), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(
      Math.floor(value) === value && !isNaN(value) &&
      value >= 100 && value <= 200
    )
  })
})

test('generates strings', t => {
  const vals = sample(gen.string, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value)
  })
})

const ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/

test('generates alphanum strings', t => {
  const vals = sample(gen.alphaNumString, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'string' && ALPHA_NUM_RX.test(value))
  })
})

test('generates substrings', t => {
  const original = 'abracadabda'
  const vals = sample(gen.substring(original), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(typeof value === 'string' && original.indexOf(value) !== -1)
  })
})

test('generates JS primitives', t => {
  const vals = sample(gen.primitive, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(!Array.isArray(value) && !(value && value.constructor === Object))
  })
})

test('generates arrays', t => {
  const vals = sample(gen.array(gen.null), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(
      Array.isArray(value) &&
      value.length >= 0 && value.every(x => x === null)
    )
  })
})

test('generates arrays of a certain length', t => {
  const vals = sample(gen.array(gen.null, { size: 3 }), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(
      Array.isArray(value) &&
      value.length === 3 && value.every(x => x === null)
    )
  })
})

test('generates arrays within a length range', t => {
  const vals = sample(gen.array(gen.null, { minSize: 3, maxSize: 5 }), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(
      Array.isArray(value) &&
      value.length >= 3 && value.length <= 5 &&
      value.every(x => x === null)
    )
  })
})

test('generates arrays from a specific definition', t => {
  const vals = sample(gen.array([gen.return(true), gen.return(false)]), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(
      Array.isArray(value) &&
      value.length === 2 && value[0] === true && value[1] === false
    )
  })
})

test('generates unique arrays', t => {
  const vals = sample(gen.uniqueArray(gen.int), 100)
  t.true(vals.length === 100)
  vals.forEach(value =>
    t.true(
      Array.isArray(value) &&
      value.every(item => value.filter(item2 => item === item2).length === 1)
    )
  )
})

test('generates unique arrays of a specific size', t => {
  const vals = sample(gen.uniqueArray(gen.int, { size: 3 }), 100)
  t.true(vals.length === 100)
  vals.forEach(value =>
    t.true(
      Array.isArray(value) &&
      value.length === 3 &&
      value.every(item => value.filter(item2 => item === item2).length === 1)
    )
  )
})

test('generates unique arrays with custom unique function', t => {
  const uniqueFn = point => point.join()
  const genPoint = gen.array([ gen.int, gen.int ])
  const genUniquePoints = gen.uniqueArray(genPoint, uniqueFn)

  const vals = sample(genUniquePoints, 100)
  t.true(vals.length === 100)
  vals.forEach(value =>
    t.true(
      Array.isArray(value) &&
      value.every(item => value.filter(item2 =>
        uniqueFn(item) === uniqueFn(item2)
      ).length === 1)
    )
  )
})

test('generates objects', t => {
  const vals = sample(gen.object(gen.null), 50)
  t.true(vals.length === 50)
  vals.forEach(value => {
    const keys = Object.keys(value)
    t.true(
      value.constructor === Object &&
      keys.length >= 0 &&
      keys.every(key => typeof key === 'string' && value[key] === null)
    )
  })
})

test('generates objects of a specific size', t => {
  const vals = sample(gen.object(gen.null, { size: 10 }), 50)
  t.true(vals.length === 50)
  vals.forEach(value => {
    const keys = Object.keys(value)
    t.true(
      value.constructor === Object &&
      keys.length === 10 &&
      keys.every(key => typeof key === 'string' && value[key] === null)
    )
  })
})

test('generates objects in a specific size range', t => {
  const vals = sample(gen.object(gen.null, { minSize: 3, maxSize: 6 }), 50)
  t.true(vals.length === 50)
  vals.forEach(value => {
    const keys = Object.keys(value)
    t.true(
      value.constructor === Object &&
      keys.length >= 3 &&
      keys.length <= 6 &&
      keys.every(key => typeof key === 'string' && value[key] === null)
    )
  })
})

test('generates objects with specific keys', t => {
  const vals = sample(gen.object(gen.alphaNumString, gen.null), 50)
  t.true(vals.length === 50)
  vals.forEach(value => {
    const keys = Object.keys(value)
    t.true(
      value.constructor === Object &&
      keys.length >= 0 &&
      keys.every(key => typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null)
    )
  })
})

test('generates objects with specific keys of a specific size', t => {
  const vals = sample(gen.object(gen.alphaNumString, gen.null, { size: 10 }), 50)
  t.true(vals.length === 50)
  vals.forEach(value => {
    const keys = Object.keys(value)
    t.true(
      value.constructor === Object &&
      keys.length === 10 &&
      keys.every(key => typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null)
    )
  })
})

test('generates objects from a specific definition', t => {
  const vals = sample(gen.object({t: gen.return(true), f: gen.return(false)}), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    const keys = Object.keys(value)
    t.true(
      value.constructor === Object &&
      keys.length === 2 && value.t === true && value.f === false
    )
  })
})

test('generates nested collections', t => {
  const vals = sample(gen.nested(gen.array, gen.int), 20)
  t.true(vals.length === 20)
  vals.forEach(arrayOrInt => {
    t.true(isNestedArrayOfInt(arrayOrInt))
  })
  function isNestedArrayOfInt(arrayOrInt) {
    return typeof arrayOrInt === 'number' ||
      (arrayOrInt.every && arrayOrInt.every(isNestedArrayOfInt))
  }
})

test('generates json primitives', t => {
  const vals = sample(gen.JSONPrimitive, 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    const jsonStr = JSON.stringify(value)
    t.true(JSON.stringify(JSON.parse(jsonStr)) === jsonStr)
  })
})

test('generates json values', t => {
  const vals = sample(gen.JSONValue, 10)
  t.true(vals.length === 10)
  vals.forEach(value => {
    const jsonStr = JSON.stringify(value)
    t.true(JSON.stringify(JSON.parse(jsonStr)) === jsonStr)
  })
})

test('generates json objects', t => {
  const vals = sample(gen.JSON, 10)
  t.true(vals.length === 10)
  vals.forEach(value => {
    const jsonStr = JSON.stringify(value)
    t.true(JSON.stringify(JSON.parse(jsonStr)) === jsonStr)
  })
})
