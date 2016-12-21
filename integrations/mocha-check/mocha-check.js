var testcheck = require('testcheck');

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
  return function () {
    // Build property
    var property = testcheck.property(argGens, propertyFn.bind(this));

    // Run testcheck
    var checkResult = testcheck.check(property, options);

    // Report results
    if (checkResult.fail) {
      var shrunk = checkResult.shrunk;
      var args = shrunk ? shrunk.smallest : checkResult.fail;
      var result = shrunk ? shrunk.result : checkResult.result;

      if (result instanceof Error) {
        result.message += ' ' + printValues(args);
        throw result
      }
      throw new Error('Failed with arguments: ' + printValues(args));
    }
  }
}

function printValues(values) {
  return require('util').inspect(values, { depth: null, colors: true });
}

exports.install = install;
exports.check = check;
exports.gen = testcheck.gen;
