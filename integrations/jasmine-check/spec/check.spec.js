require('../jasmine-check').install();

describe('check', function () {

  it('was installed correctly', function () {
    expect(typeof check.it === 'function').toBe(true);
  })

  check.it('generates', gen.int, gen.string, (x, y) => {
    expect(x).toEqual(jasmine.any(Number));
    expect(y).toEqual(jasmine.any(String));
  })

  check.it('generates with arg array', [gen.int, gen.string], (x, y) => {
    expect(x).toEqual(jasmine.any(Number));
    expect(y).toEqual(jasmine.any(String));
  })

  check.it('generates with options', {times: 100}, gen.sPosInt, x => {
    expect(x).toBeGreaterThan(0);
  })

});
