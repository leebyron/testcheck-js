var testcheck = require('testcheck');

function install(globalObj) {
  globalObj = globalObj || global || window;
  if (!globalObj || !globalObj.jasmine) {
    throw new Error('Make sure install is called after jasmine is available.');
  }
  var jasmine = globalObj.jasmine;
  globalObj.gen = testcheck.gen;
  globalObj.check = {
    it: check.curry('it', jasmine),
    xit: check.curry('xit', jasmine),
    iit: check.curry('iit', jasmine),
  };
}

function check(it, jasmine, specName, options, argGens, propertyFn) {
  if (!propertyFn) {
    propertyFn = argGens;
    argGens = options;
    options = {};
  }

  var jasmineEnv = jasmine.getEnv();

  if (jasmineEnv.version().major !== 1 || jasmineEnv.version().minor !== 3) {
    throw new Error('jasmine-check currently only supports jasmine v1.3.x');
  }

  return jasmineEnv[it](specName, function() {
    var currentSpec = jasmineEnv.currentSpec;

    // Intercept match results
    var matchFailed = false;
    var matchResults = [];
    var failingMatchResults = [];

    currentSpec._super_addMatcherResult = currentSpec.addMatcherResult;
    currentSpec.addMatcherResult = function(result) {
      matchResults.push(result);
      if (!result.passed()) {
        matchFailed = true;
      }
    };
    currentSpec.fail = function(e) {
      this.addMatcherResult(new jasmine.ExpectationResult({
        passed: false,
        message: e ? jasmine.util.formatException(e) + '.' : 'Exception.',
        trace: { stack: e.stack }
      }));
    };

    // Build property
    var thisArg = this;
    var property = testcheck.property(argGens, function() {
      try {
        propertyFn.apply(thisArg, arguments);
      } catch (error) {
        currentSpec.fail(error);
      }
      var returnPassed = !matchFailed;
      if (matchFailed) {
        failingMatchResults = matchResults;
      }
      matchFailed = false;
      matchResults = [];
      return returnPassed;
    });

    // Run testcheck
    var checkResult = testcheck.check(property, options);

    // Report results
    (failingMatchResults || matchResults).forEach(function (matchResult) {
      if (checkResult.result === false) {
        matchResult.message +=
          ' Checked with: ' + JSON.stringify(checkResult.shrunk.smallest);
      }
      currentSpec._super_addMatcherResult(matchResult);
    });
  });
}

// utils

var slice = Array.prototype.slice;

check.curry = function () {
  var fn = this;
  var curriedArgs = slice.call(arguments);
  return function() {
    return fn.apply(this, curriedArgs.concat(slice.call(arguments)));
  };
}

exports.install = install;
