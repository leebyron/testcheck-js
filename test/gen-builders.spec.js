// @flow

const test = require('ava');
const { gen, sample, sampleOne } = require('../')

test('sample defaults to 10', t => {
  const vals = sample(gen.int)
  t.true(vals.length === 10)
})

test('samples one of a given size', t => {
  const val = sampleOne(gen.int)
  t.true(typeof val === 'number')
})

test('samples one of a given size', t => {
  const simpleSized = gen.sized(s => s)
  const val = sampleOne(simpleSized, 55)
  t.true(val === 55)
})

test('generates an exact value', t => {
  const vals = sample(gen.return('wow'), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(value === 'wow')
  })
})

test('generators are iterable', t => {
  const values = []
  for (let value of gen.int) {
    values.push(value)
    if (value > 10) {
      break
    }
  }
  t.true(values.length > 0)
})

test('generates one of a collection of values', t => {
  const vals = sample(gen.oneOf(['foo', 'bar', 'baz']), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    t.true(value === 'foo' || value === 'bar' || value === 'baz')
  })
})

test('generates one of other generators', t => {
  const vals = sample(gen.oneOf([gen.int, gen.boolean]), 100)
  t.true(vals.length === 100)
  vals.forEach(value => {
    const type = typeof value
    t.true(type === 'number' || type === 'boolean')
  })
})

test('generates one of other generators in a weighted fashion', t => {
  const vals = sample(gen.oneOfWeighted([[2, 'foo'], [1, 'bar'], [6, 'baz']]), 1000)
  t.true(vals.length === 1000)
  vals.forEach(value => {
    t.true(value === 'foo' || value === 'bar' || value === 'baz')
  })
  const fooCount = vals.reduce((count, val) => count + (val === 'foo'), 0)
  const barCount = vals.reduce((count, val) => count + (val === 'bar'), 0)
  const bazCount = vals.reduce((count, val) => count + (val === 'baz'), 0)
  t.true(fooCount > barCount)
  t.true(bazCount > fooCount)
})

test('generates one of other generators in a weighted fashion', t => {
  const vals = sample(gen.oneOfWeighted([[2, gen.int], [1, gen.boolean]]), 1000)
  t.true(vals.length === 1000)
  vals.forEach(value => {
    const type = typeof value
    t.true(type === 'number' || type === 'boolean')
  })
  const intCount = vals.reduce((count, val) => count + (typeof val === 'number'), 0)
  const boolCount = vals.reduce((count, val) => count + (typeof val === 'boolean'), 0)
  t.true(intCount > boolCount)
})

test('.then() maps a generator value', t => {
  const genSquares = gen.posInt.then(n => n * n)
  const vals = sample(genSquares, 100)
  vals.forEach(value => {
    t.true(typeof value === 'number' && Number.isInteger(Math.sqrt(value)))
  })
})

test('.then() creates a new generator from an existing one', t => {
  const genNotEmptyList = gen.array(gen.int).notEmpty()
  const genListAndItem = genNotEmptyList.then(
    list => gen.array([ list, gen.oneOf(list) ])
  )
  const vals = sample(genListAndItem, 100)
  vals.forEach(pair => {
    const list = pair[0]
    const item = pair[1]
    t.true(Array.isArray(list) && typeof item === 'number' && list.indexOf(item) !== -1)
  })
})

test('.suchThat() narrows down possible values', t => {
  const nonFives = gen.int.suchThat(n => n % 5 !== 0)
  const vals = sample(nonFives, 100)
  vals.forEach(nonFive => {
    t.true(Number.isInteger(nonFive / 5) === false)
  })
})

test('scales a generator to grow at non-linear rates', t => {
  const genInts = gen.int
  const values = sample(genInts, 100)
  t.true(values.filter(n => n > 100).length === 0)

  const genHugeInts = gen.int.scale(n => n * n)
  const hugeValues = sample(genHugeInts, 100)
  t.true(hugeValues.filter(n => n > 100).length > 0)
})

test('creates nullable generators', t => {
  const values = sample(gen.int, 100)
  const nullableValues = sample(gen.int.nullable(), 100)

  t.true(values.filter(n => n === null).length === 0)
  t.true(nullableValues.filter(n => n === null).length > 0)
})
