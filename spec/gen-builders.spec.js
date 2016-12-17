// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare function beforeEach(): void; */
/*:: declare var jasmine: any; */

const { gen } = require('../')

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
    const vals = gen.int.sample()
    expect(vals.length).toBe(10)
  })

  it('generates an exact value', () => {
    const vals = gen.return('wow').sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === 'wow'
    })
  })

  it('generates one of a collection of values', () => {
    const vals = gen.oneOf(['foo', 'bar', 'baz']).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      return value === 'foo' || value === 'bar' || value === 'baz'
    })
  })

  it('generates one of other generators', () => {
    const vals = gen.oneOf([gen.int, gen.boolean]).sample(100)
    expect(vals.length).toBe(100)
    expect(vals).toAllPass(function (value) {
      const type = typeof value
      return type === 'number' || type === 'boolean'
    })
  })

  it('generates one of other generators in a weighted fashion', () => {
    const vals = gen.oneOfWeighted([[2, 'foo'], [1, 'bar'], [6, 'baz']]).sample(10000)
    expect(vals.length).toBe(10000)
    expect(vals).toAllPass(function (value) {
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
    const vals = gen.oneOfWeighted([[2, gen.int], [1, gen.boolean]]).sample(10000)
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
    const genSquares = gen.posInt.then(n => n * n)
    const vals = genSquares.sample(100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && Number.isInteger(Math.sqrt(value))
    })
  })

  it('bind creates a new generator from an existing one', () => {
    const genList = gen.notEmpty(gen.array(gen.int))
    const genListAndItem = genList.then(
      list => gen.array([ list, gen.oneOf(list) ])
    )
    const vals = genListAndItem.sample(100)
    expect(vals).toAllPass(function (pair) {
      const list = pair[0]
      const item = pair[1]
      return Array.isArray(list) && typeof item === 'number' && list.indexOf(item) !== -1
    })
  })

})
