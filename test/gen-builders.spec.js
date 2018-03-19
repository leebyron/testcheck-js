// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare function beforeEach(fn: () => void): void; */
/*:: declare var jasmine: any; */

const { gen, sample, sampleOne } = require('../')

describe('gen builders', () => {

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

  it('sample defaults to 10', () => {
    const vals = sample(gen.int)
    expect(vals.length).toBe(10)
  })

  it('samples one of a given size', () => {
    const val = sampleOne(gen.int)
    expect(typeof val === 'number')
  })

  it('samples one of a given size', () => {
    const simpleSized = gen.sized(s => s)
    const val = sampleOne(simpleSized, 55)
    expect(val).toBe(55)
  })

  it('generates an exact value', () => {
    const vals = sample(gen.return('wow'), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === 'wow'
    })
  })

  it('generators are iterable', () => {
    const values = []
    for (let value of gen.int) {
      values.push(value)
      if (value > 10) {
        break
      }
    }
    expect(values.length).toBeGreaterThan(0)
  })

  it('generates one of a collection of values', () => {
    const vals = sample(gen.oneOf(['foo', 'bar', 'baz']), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === 'foo' || value === 'bar' || value === 'baz'
    })
  })

  it('generates one of other generators', () => {
    const vals = sample(gen.oneOf([gen.int, gen.boolean]), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      const type = typeof value
      return type === 'number' || type === 'boolean'
    })
  })

  it('generates one of other generators in a weighted fashion', () => {
    const vals = sample(gen.oneOfWeighted([[2, 'foo'], [1, 'bar'], [6, 'baz']]), 1000)
    expect(vals.length).toBe(1000)
    expect(vals).toAllPass(function (value) {
      return value === 'foo' || value === 'bar' || value === 'baz'
    })
    const fooCount = vals.reduce((count, val) => count + (val === 'foo'), 0)
    const barCount = vals.reduce((count, val) => count + (val === 'bar'), 0)
    const bazCount = vals.reduce((count, val) => count + (val === 'baz'), 0)
    expect(fooCount).toBeGreaterThan(barCount)
    expect(bazCount).toBeGreaterThan(fooCount)
  })

  it('generates one of other generators in a weighted fashion', () => {
    const vals = sample(gen.oneOfWeighted([[2, gen.int], [1, gen.boolean]]), 1000)
    expect(vals.length).toBe(1000)
    expect(vals).toAllPass(function (value) {
      const type = typeof value
      return type === 'number' || type === 'boolean'
    })
    const intCount = vals.reduce((count, val) => count + (typeof val === 'number'), 0)
    const boolCount = vals.reduce((count, val) => count + (typeof val === 'boolean'), 0)
    expect(intCount).toBeGreaterThan(boolCount)
  })

  it('.then() maps a generator value', () => {
    const genSquares = gen.posInt.then(n => n * n)
    const vals = sample(genSquares, 100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && Number.isInteger(Math.sqrt(value))
    })
  })

  it('.then() creates a new generator from an existing one', () => {
    const genNotEmptyList = gen.array(gen.int).notEmpty()
    const genListAndItem = genNotEmptyList.then(
      list => gen.array([ list, gen.oneOf(list) ])
    )
    const vals = sample(genListAndItem, 100)
    expect(vals).toAllPass(function (pair) {
      const list = pair[0]
      const item = pair[1]
      return Array.isArray(list) && typeof item === 'number' && list.indexOf(item) !== -1
    })
  })

  it('.suchThat() narrows down possible values', () => {
    const nonFives = gen.int.suchThat(n => n % 5 !== 0)
    const vals = sample(nonFives, 100)
    expect(vals).toAllPass(
      nonFive => Number.isInteger(nonFive / 5) === false
    )
  })

  it('scales a generator to grow at non-linear rates', () => {
    const genInts = gen.int
    const values = sample(genInts, 100)
    expect(values.filter(n => n > 100).length).toBe(0)

    const genHugeInts = gen.int.scale(n => n * n)
    const hugeValues = sample(genHugeInts, 100)
    expect(hugeValues.filter(n => n > 100).length).toBeGreaterThan(0)
  })

  it('creates nullable generators', () => {
    const values = sample(gen.int, 100)
    const nullableValues = sample(gen.int.nullable(), 100)

    expect(values.filter(n => n === null).length).toBe(0)
    expect(nullableValues.filter(n => n === null).length).toBeGreaterThan(0)
  })

})
