var testcheck = require('testcheck');

exports.gen = testcheck.gen;
exports.check = check;

function check(/* [options,] ...args, propertyFn */) {
  // Gather arguments:
  // - options, genArray, propFn
  // - genArray, propFn
  // - options, gen, gen, propFn
  // - gen, gen, propFn
  var i = 0;
  var n = arguments.length - 1;
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

  // Current stack used for failing tests without errors.
  var callingStack = {};
  Error.captureStackTrace(callingStack, check);

  return function (api) {
    var fn = propertyFn.bind(this, api);
    var test = this;

    // Build property
    var property = testcheck.property(argGens, function testcheck$property() {
      // Reset assertions and plan before every run.
      test.assertError = undefined;
      test.assertions = [];
      test.planCount = null;
      test.planStack = null;

      var result = fn.apply(null, arguments);

      // Check plan after every run.
      test._checkPlanCount();

      if (test.assertError) {
        throw test.assertError;
      }

      return result;
    });

    // Run testcheck
    var checkResult = testcheck.check(property, options);

    // Report results
    if (checkResult.fail) {
      var shrunk = checkResult.shrunk;
      var args = shrunk ? shrunk.smallest : checkResult.fail;
      var result = shrunk ? shrunk.result : checkResult.result;

      test.title += ' ' + printArgs(args)
      if (result instanceof Error) {
        test.assertError = cleanStack(result);
      } else {
        var error = new Error(String(result));
        error.stack = callingStack.stack;
        error.actual = result;
        error.expected = true;
        error.operator = '===';
        test.assertError = error;
      }
    }
  }
}

function printArgs(args) {
  return '(' + require('util').inspect(args, { depth: null, colors: true }).slice(1, -1) + ')'
}

function cleanStack(error) {
  var stack = error.stack.split('\n')
  for (var i = 1; i < stack.length; i++) {
    if (stack[i].indexOf('testcheck$property') !== -1) {
      break;
    }
  }
  error.stack = stack.slice(0, i).join('\n');
  return error;
}
