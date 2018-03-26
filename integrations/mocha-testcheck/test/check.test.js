require('../mocha-check').install();
const { expect } = require('chai');

describe('check', function () {

  it('was installed correctly', () => {
    expect(check.it).to.be.a('function')
  })

  check.it('generates', gen.int, gen.string, (x, y) => {
    expect(x).to.be.a('number')
    expect(y).to.be.a('string')
  })

  check.it('supports array of gens', [gen.int, gen.string], (x, y) => {
    expect(x).to.be.a('number')
    expect(y).to.be.a('string')
  })

  check.it('supports returning a boolean', gen.int, x =>
    typeof x === 'number'
  )

  it('can use check as a spec wrapper', check(gen.posInt, gen.posInt, (x, y) => {
    expect(x + y).to.be.at.least(0)
  }))

  it('can use check as a spec wrapper with array of gens', check([gen.posInt, gen.posInt], (x, y) => {
    expect(x + y).to.be.at.least(0)
  }))

  check.it('generates with options', {numTests: 10}, gen.posInt, x => {
    expect(x).to.be.at.least(0)
  })

  check.specify('specify can be used as alias for it', gen.int, x => {
    expect(x).to.be.a('number')
  })

  it('outputs well formed shrunk data', () => {
    let caughtError;
    try {
      check.it('will fail with this assertion', gen.int, x => {
        expect(x).to.at.most(10)
      }).fn()
    } catch (error) {
      caughtError = error;
    }
    expect(noColor(caughtError.message)).to.contain(
      '( 11 ) => AssertionError: expected 11 to be at most 10'
    );
  })

  it('outputs well formed shrunk data when throwing normal error', () => {
    let caughtError;
    try {
      check.it('will fail with this assertion', gen.int, x => {
        if (x > 10) {
          throw new Error('Expected ' + x + ' to be at most 10');
        }
      }).fn()
    } catch (error) {
      caughtError = error;
    }
    expect(noColor(caughtError.message)).to.contain(
      '( 11 ) => Error: Expected 11 to be at most 10'
    );
  })

  it('outputs well formed shrunk data when returning boolean', () => {
    let caughtError;
    try {
      check.it('will fail with this assertion', gen.int, x =>
        x <= 10
      ).fn()
    } catch (error) {
      caughtError = error;
    }
    expect(noColor(caughtError.message)).to.contain(
      '( 11 ) => false'
    );
  })

});

function noColor(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}
