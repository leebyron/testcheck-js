var testcheck = require('testcheck');
var util = require('util');

function install(globalObj) {
  globalObj = globalObj || global || window;
  if (!globalObj || !globalObj.it) {
    throw new Error('Make sure install is called after mocha is available.');
  }

  check.it = check.specify = check.test = checkIt(globalObj.it);
  check.it.only = checkIt(globalObj.it.only);
  check.xit = check.xspecify = check.it.skip = globalObj.it.skip;

  globalObj.gen = testcheck.gen;
  globalObj.check = check;
}

function checkIt(it) {
  return function(specName, options, argGens, propertyFn) {
    return it.call(this, specName, check(options, argGens, propertyFn));
  }
}

function check(options, argGens, propertyFn) {
  if (!propertyFn) {
    propertyFn = argGens;
    argGens = options;
    options = {};
  }

  // Return test function which runs testcheck and throws if it fails.
  return function() {
    // Intercept match results
    var lastError;

    // Build property
    var thisArg = this;
    var property = testcheck.property(argGens, function() {
      try {
        propertyFn.apply(thisArg, arguments);
      } catch (error) {
        lastError = error;
        return false;
      }
      return true;
    });

    // Run testcheck
    var checkResult = testcheck.check(property, options);

    // Report results
    if (checkResult.result === false) {
      lastError.check = checkResult;
      lastError.message += ' ' + printValues(checkResult.shrunk.smallest);
      throw lastError;
    }
  }
}

function printValues(values) {
  return util.inspect(values, { depth: null, colors: true });
}

exports.install = install;
exports.check = check;
exports.gen = testcheck.gen;
