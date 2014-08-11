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
    expect(result['num-tests']).toBe(100);
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
    expect(calls).toBe(result['num-tests'] + result.shrunk['total-nodes-visited']);
    expect(result.result).toBe(false);
    expect(result.fail).toEqual(jasmine.any(Array))
    expect(result.fail.length).toBe(1);
    expect(result.shrunk).toEqual(jasmine.any(Object));
    expect(result.shrunk.smallest).toEqual([42]);

  });

});
