require('../jasmine-check').install();

describe('check', function () {

  it('was installed correctly', function () {

  })

  check.it('generates', [gen.int, gen.string], function(x, y) {
    console.log(x,y);
    expect(true).toBeTrue();
  })

  check.it('generates with options', [gen.int], {times: 10}, function(x) {
    console.log(x);
    expect(true).toBeTrue();
  })

});
