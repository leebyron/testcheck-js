// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare function beforeEach(): void; */
/*:: declare var jasmine: any; */

const { sample, gen } = require('../')

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
      },
      toBeApprx: function(value, epsilon) {
        epsilon = epsilon || (value / 10)
        return Math.abs(this.actual - value) < epsilon
      }
    })
  })

  it('sample defaults to 10', () => {
    const vals = sample(gen.int)
    expect(vals.length).toBe(10)
  })

  it('generates an exact value', () => {
    const vals = sample(gen.return('wow'), 100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === 'wow'
    })
  })

  it('generates one of a collection of values', () => {
    const vals = sample(gen.returnOneOf(['foo', 'bar', 'baz']), 100)
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
    const vals = sample(gen.returnOneOfWeighted([[2, 'foo'], [1, 'bar'], [6, 'baz']]), 10000)
    expect(vals.length).toBe(10000)
    expect(vals).toAllPass(function (value) {
      const type = typeof value
      return value === 'foo' || value === 'bar' || value === 'baz'
    })
    const fooCount = vals.reduce(function (count, val) { return count + (val === 'foo'); }, 0)
    const barCount = vals.reduce(function (count, val) { return count + (val === 'bar'); }, 0)
    const bazCount = vals.reduce(function (count, val) { return count + (val === 'baz'); }, 0)
    expect(fooCount / barCount).toBeApprx(2)
    expect(bazCount / barCount).toBeApprx(6)
    expect(bazCount / fooCount).toBeApprx(3)
  })

  it('generates one of other generators in a weighted fashion', () => {
    const vals = sample(gen.oneOfWeighted([[2, gen.int], [1, gen.boolean]]), 10000)
    expect(vals.length).toBe(10000)
    expect(vals).toAllPass(function (value) {
      const type = typeof value
      return type === 'number' || type === 'boolean'
    })
    const intCount = vals.reduce(function (count, val) { return count + (typeof val === 'number'); }, 0)
    const boolCount = vals.reduce(function (count, val) { return count + (typeof val === 'boolean'); }, 0)
    expect(intCount / boolCount).toBeApprx(2)
  })

  it('maps a generator value', () => {
    const genSquares = gen.map(gen.posInt, n => n * n)
    const vals = sample(genSquares, 100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && Number.isInteger(Math.sqrt(value))
    })
  })

  it('bind creates a new generator from an existing one', () => {
    const genListAndItem = gen.bind(
      gen.notEmpty(gen.array(gen.int)),
      list => gen.array([ gen.return(list), gen.returnOneOf(list) ])
    )
    const vals = sample(genListAndItem, 100)
    expect(vals).toAllPass(function (pair) {
      const list = pair[0]
      const item = pair[1]
      return Array.isArray(list) && typeof item === 'number' && list.indexOf(item) !== -1
    })
  })

})
