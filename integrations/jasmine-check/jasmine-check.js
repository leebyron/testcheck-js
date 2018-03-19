var testcheck = require('testcheck');
var jasmine;
var isJasmineV1;

function install(globalObj) {
  globalObj = globalObj || global || window;
  if (!globalObj || !globalObj.jasmine) {
    throw new Error('Make sure install is called after jasmine is available.');
  }

  // Don't install more than once.
  if (globalObj.check) {
    return;
  }

  jasmine = globalObj.jasmine;
  var jasmineEnv = jasmine.getEnv();
  isJasmineV1 = jasmineEnv.version && jasmineEnv.version().major === 1;

  var check = {};
  check.it = checkIt(globalObj.it);
  check.xit = check.it.skip = checkIt(globalObj.xit);

  var iit = globalObj.iit || globalObj.it.only || globalObj.fit;
  if (iit) {
    check.iit = check.it.only = check.fit = checkIt(iit);
  }

  globalObj.gen = testcheck.gen;
  globalObj.check = check;
}

function checkIt(it) {
  return function(/* specName, [options,] ...args, propertyFn */) {
    // Gather arguments:
    // - name, options, genArray, propFn
    // - name, genArray, propFn
    // - name, options, gen, gen, propFn
    // - name, gen, gen, propFn
    var i = 0;
    var n = arguments.length - 1;
    var specName = arguments[i++];
    var options = arguments[i].constructor === Object ? arguments[i++] : {};
    var propertyFn = arguments[n];
    var argGens;
    if (n - i === 1 && Array.isArray(arguments[i])) {
      argGens = arguments[i]
    } else {
      argGens = [];
      for (; i < n; i++) {
        argGens.push(arguments[i]);
      }
    }

    if (!propertyFn) {
      propertyFn = argGens;
      argGens = options;
      options = {};
    }

    var spec = it(specName, checkRunner);
    return spec;

    function checkRunner() {
      // Intercept match results
      var matchFailed = false;
      var matchResults = [];
      var failingMatchResults;

      var addResult = spec.addMatcherResult ?
        spec.addMatcherResult.bind(spec) :
        spec.addExpectationResult.bind(spec, false);

      var existingSpecFail = spec.fail;
      var existingAddExpectationResult = spec.addExpectationResult;
      var existingAddMatcherResult = spec.addMatcherResult;

      var checkAddExpectationResult = function(passed, data) {
        if (passed) {
          return;
        }
        matchFailed = true;
        matchResults.push(data);
      };

      var checkAddMatcherResult = function(result) {
        matchResults.push(result);
        if (!result.passed()) {
          matchFailed = true;
        }
      };

      // Build property
      var thisArg = this;
      var property = testcheck.property(argGens, function() {
        spec.fail = logException;
        spec.addExpectationResult = checkAddExpectationResult;
        spec.addMatcherResult = checkAddMatcherResult;
        matchFailed = false;
        matchResults = [];
        try {
          propertyFn.apply(thisArg, arguments);
        } catch (error) {
          spec.fail(error);
        }
        if (matchFailed) {
          failingMatchResults = matchResults;
        }
        spec.fail = existingSpecFail;
        spec.addExpectationResult = existingAddExpectationResult;
        spec.addMatcherResult = existingAddMatcherResult;
        return !matchFailed;
      });

      // Run testcheck
      var checkResult = testcheck.check(property, options);
      if (checkResult.fail) {
        var failingArgs = printArgs(checkResult.shrunk.smallest, checkResult.seed);
        spec.description += failingArgs;
        if (spec.results) {
          spec.results().description += failingArgs;
        } else {
          spec.result.description += failingArgs;
          spec.result.fullName += failingArgs;
        }
        spec.check = checkResult;
      }

      // Report results
      (failingMatchResults || matchResults).forEach(function (matchResult) {
        addResult(matchResult);
      });
    }
  }
}

function logException(e) {
  if (isJasmineV1) {
    this.addMatcherResult(new jasmine.ExpectationResult({
      passed: false,
      message: e ? jasmine.util.formatException(e) : 'Exception.',
      trace: { stack: e.stack }
    }));
  } else {
    this.addExpectationResult(false, {
      matcherName: "",
      passed: false,
      expected: "",
      actual: "",
      error: e
    });
  }
}

function printArgs(args, seed) {
  const inspect = require('util').inspect
  let toStr = (x) => inspect(x, { depth: null, colors: true }).slice(1, -1)
  return ' (' + toStr(args) + ') Seed:' + toStr([seed]);
}

exports.install = install;
