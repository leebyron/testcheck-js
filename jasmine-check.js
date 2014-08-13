var testcheck = require('testcheck');

function install(globalObj) {
  globalObj = globalObj || global || window;
  if (!globalObj || !globalObj.jasmine) {
    throw new Error('Make sure install is called after jasmine is available.');
  }

  jasmine = globalObj.jasmine;
  jasmineEnv = jasmine.getEnv();
  if (jasmineEnv.version().major !== 1 || jasmineEnv.version().minor !== 3) {
    throw new Error('jasmine-check currently only supports jasmine v1.3.x');
  }

  check.it = checkIt(globalObj.it);
  check.iit = check.it.only = checkIt(globalObj.iit);
  check.xit = check.it.skip = checkIt(globalObj.xit);

  globalObj.gen = testcheck.gen;
  globalObj.check = check;
}

var jasmine, jasmineEnv;

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
  }
}

exports.install = install;
