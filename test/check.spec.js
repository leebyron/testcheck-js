// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare var jasmine: any; */

const { check, property, gen } = require('../')

describe('check', () => {

  it('checks true properties', () => {

    const seedVal = 1234567890
    let calls = 0

    const result = check(property(
      gen.posInt,
      function (intValue) {
        calls++
        return intValue >= 0
      }
    ), { numTests: 100, seed: seedVal })

    expect(calls).toBe(100)
    expect(result.result).toBe(true)
    expect(result.numTests).toBe(100)
    expect(result.seed).toBe(seedVal)

  })

  it('checks false properties', () => {

    const seedVal = 1234567890
    let calls = 0

    const result = check(property(
      gen.posInt,
      function (intValue) {
        calls++
        return intValue >= 0 && intValue < 42
      }
    ), { numTests: 100, seed: seedVal })

    expect(calls).toBeLessThan(100)
    const shrunk = result.shrunk
    const fail = result.fail
    expect(shrunk).toEqual(jasmine.any(Object))
    expect(fail).toEqual(jasmine.any(Array))
    if (shrunk != null && fail != null) { // flow
      expect(calls).toBe(result.numTests + shrunk.totalNodesVisited)
      expect(result.result).toBe(false)
      expect(fail.length).toBe(1)
      expect(shrunk.smallest).toEqual([42])
    }
  })

  it('accepts multiple generators as arguments', () => {
    let calls = 0

    const result = check(property(
      gen.posInt, gen.string,
      function (intValue, string) {
        calls++
        return intValue >= 0 && typeof string === 'string'
      }
    ))

    expect(calls).toBe(100)
    expect(result.fail).toBe(undefined)
    expect(result.result).toBe(true)
    expect(result.numTests).toBe(100)
  })

  it('tests properties that throw', () => {
    const result = check(property(
      gen.int,
      function (intValue) {
        if (intValue < -10) {
          throw new Error('Expected ' + intValue + ' to be at least -10')
        }
      }
    ))

    expect(result.shrunk).toEqual(jasmine.any(Object))
    expect(result.fail).toEqual(jasmine.any(Array))
    expect(result.result instanceof Error).toBe(true)

    const shrunk = result.shrunk
    if (shrunk && shrunk.result instanceof Error) { // flow
      expect(shrunk.result.message).toBe('Expected -11 to be at least -10')
      expect(shrunk.smallest).toEqual([ -11 ])
    }
  })

  it('tests properties that throw and pass', () => {
    const result = check(property(
      gen.posInt,
      function (intValue) {
        if (intValue < 0) {
          throw new Error('Expected ' + intValue + ' to be at least 0')
        }
      }
    ))

    expect(result.fail).toBe(undefined)
    expect(result.result).toBe(true)
  })

  it('accepts deprecated options', () => {
    let calls = 0

    // $ExpectError
    const result = check(property(gen.int, () => true), { times: 100 })

    expect(result.numTests).toBe(100)
  })

  it('supports deprecated array properties', () => {
    let calls = 0

    // $ExpectError
    const result = check(property(
      [gen.posInt, gen.string],
      function (intValue, string) {
        calls++
        return intValue >= 0 && typeof string === 'string'
      }
    ), { times: 100 })

    expect(calls).toBe(100)
    expect(result.result).toBe(true)
    expect(result.numTests).toBe(100)
  })

  it('supports recursive generators', () => {
    const result = check(property(
      gen.recursive(gen.array, gen.int),
      (v) => Array.isArray(v) || typeof v === 'number'
    ))

    expect(result.fail).toBe(undefined)
    expect(result.result).toBe(true)
  })

})
