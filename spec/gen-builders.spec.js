describe('gen builders', function () {

  var testcheck = require('../');
  var gen = testcheck.gen;

  beforeEach(function () {
    this.addMatchers({
      toAllPass: function(predicate) {
        var failedValue;
        var pass = this.actual.every(function (value) {
          if (predicate(value)) {
            return true;
          } else {
            failedValue = value;
          }
        });
        this.message = function() {
          return 'Expected ' + JSON.stringify(failedValue) + ' to pass ' + predicate;
        };
        return pass;
      },
      toBeApprx: function(value, epsilon) {
        epsilon = epsilon || 0.333;
        return Math.abs(this.actual - value) < epsilon;
      }
    })
  });

  it('sample defaults to 10', function () {
    var vals = testcheck.sample(gen.int);
    expect(vals.length).toBe(10);
  });

  it('generates an exact value', function () {
    var vals = testcheck.sample(gen.return('wow'), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return value === 'wow';
    });
  });

  it('generates one of a collection of values', function () {
    var vals = testcheck.sample(gen.returnOneOf(['foo', 'bar', 'baz']), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      return value === 'foo' || value === 'bar' || value === 'baz';
    });
  });

  it('generates one of other generators', function () {
    var vals = testcheck.sample(gen.oneOf([gen.int, gen.boolean]), 100);
    expect(vals.length).toBe(100);
    expect(vals).toAllPass(function (value) {
      var type = typeof value;
      return type === 'number' || type === 'boolean';
    });
  });

  it('generates one of other generators in a weighted fashion', function () {
    var vals = testcheck.sample(gen.returnOneOfWeighted([[2, 'foo'], [1, 'bar'], [6, 'baz']]), 10000);
    expect(vals.length).toBe(10000);
    expect(vals).toAllPass(function (value) {
      var type = typeof value;
      return value === 'foo' || value === 'bar' || value === 'baz';
    });
    var fooCount = vals.reduce(function (count, val) { return count + (val === 'foo'); }, 0);
    var barCount = vals.reduce(function (count, val) { return count + (val === 'bar'); }, 0);
    var bazCount = vals.reduce(function (count, val) { return count + (val === 'baz'); }, 0);
    expect(fooCount / barCount).toBeApprx(2);
    expect(bazCount / barCount).toBeApprx(6);
    expect(bazCount / fooCount).toBeApprx(3);
  });

  it('generates one of other generators in a weighted fashion', function () {
    var vals = testcheck.sample(gen.oneOfWeighted([[2, gen.int], [1, gen.boolean]]), 10000);
    expect(vals.length).toBe(10000);
    expect(vals).toAllPass(function (value) {
      var type = typeof value;
      return type === 'number' || type === 'boolean';
    });
    var intCount = vals.reduce(function (count, val) { return count + (typeof val === 'number'); }, 0);
    var boolCount = vals.reduce(function (count, val) { return count + (typeof val === 'boolean'); }, 0);
    expect(intCount / boolCount).toBeApprx(2);
  });

  it('maps a generator value', function () {
    var genSquares = gen.map(gen.posInt, n => n * n);
    var vals = testcheck.sample(genSquares, 100)
    expect(vals).toAllPass(function (value) {
      return typeof value === 'number' && Number.isInteger(Math.sqrt(value))
    });
  });

  it('bind creates a new generator from an existing one', function () {
    var genListAndItem = gen.bind(
      gen.notEmpty(gen.array(gen.int)),
      list => gen.array([ gen.return(list), gen.returnOneOf(list) ])
    );
    var vals = testcheck.sample(genListAndItem, 100)
    expect(vals).toAllPass(function (pair) {
      var list = pair[0]
      var item = pair[1]
      return Array.isArray(list) && typeof item === 'number' && list.indexOf(item) !== -1;
    });
  })

});
