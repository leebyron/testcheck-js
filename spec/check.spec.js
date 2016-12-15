// @flow

/*:: declare function describe(name: string, fn: () => void): void; */
/*:: declare function it(name: string, fn: () => void): void; */
/*:: declare function expect(val: any): any; */
/*:: declare var jasmine: any; */

describe('check', function () {

  var testcheck = require('../');
  var gen = testcheck.gen;

  it('checks true properties', function () {

    var seedVal = 1234567890;
    var calls = 0;

    var result = testcheck.check(testcheck.property(
      [gen.posInt],
      function (intValue) {
        calls++;
        return intValue >= 0;
      }
    ), { times: 100, seed: seedVal });

    expect(calls).toBe(100);
    expect(result.result).toBe(true);
    expect(result.numTests).toBe(100);
    expect(result.seed).toBe(seedVal);

  });

  it('checks false properties', function () {

    var seedVal = 1234567890;
    var calls = 0;

    var result = testcheck.check(testcheck.property(
      [gen.posInt],
      function (intValue) {
        calls++;
        return intValue >= 0 && intValue < 42;
      }
    ), { times: 100, seed: seedVal });

    expect(calls).toBeLessThan(100);
    const shrunk = result.shrunk
    const fail = result.fail
    expect(shrunk).toEqual(jasmine.any(Object));
    expect(fail).toEqual(jasmine.any(Array))
    if (shrunk != null && fail != null) { // flow
      expect(calls).toBe(result.numTests + shrunk.totalNodesVisited);
      expect(result.result).toBe(false);
      expect(fail.length).toBe(1);
      expect(shrunk.smallest).toEqual([42]);
    }
  });

});
