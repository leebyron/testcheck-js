// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare var jasmine: any; */

const { check, checkAsync, property, gen } = require('../')

describe('check', () => {

  it('async', (done) => {
    const promise = checkAsync(property(gen.int, (i) => Promise.resolve(i)))

    promise.then((result) => console.log(result) || done())
  })

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
    ), { numTests: 100 })

    expect(calls).toBe(100)
    expect(result.result).toBe(true)
    expect(result.numTests).toBe(100)
  })

  it('generates unique arrays', () => {
    const uniqueWithNils = gen.uniqueArray(
      gen.oneOf([gen.null, gen.undefined, gen.NaN, gen.boolean, gen.number])
    );
    const result = check(property(uniqueWithNils, arr => {
      const numNull = arr.filter(val => val === null).length;
      const numUndef = arr.filter(val => val === undefined).length;
      const numNaN = arr.filter(val => val !== val).length;
      const numTrue = arr.filter(val => val === true).length;
      const numFalse = arr.filter(val => val === false).length;
      return numNull <= 1 && numUndef <= 1 && numNaN <= 1 && numTrue <= 1 && numFalse <= 1;
    }), { numTests: 200 });

    if (result.result !== true) {
      console.error(result)
    }
    expect(result.result).toBe(true)
  })

  it('generates unique arrays of complex values', () => {
    const uniqueComplex = gen.uniqueArray(gen.array([gen.posInt]));
    const result = check(property(uniqueComplex, arr => {
      const keyCount = {};
      arr.forEach(complex => {
        const key = JSON.stringify(complex);
        keyCount[key] = (keyCount[key] || 0) + 1;
      });
      Object.keys(keyCount).forEach(key => {
        if (key !== 1) {
          return false;
        }
      });
    }), { numTests: 200 });

    if (result.result !== true) {
      console.error(result)
    }
    expect(result.result).toBe(true)
  })

})
