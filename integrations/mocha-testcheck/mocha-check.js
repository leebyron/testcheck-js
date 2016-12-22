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

    return it.call(this, specName, runCheck(options, argGens, propertyFn));
  }
}

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

  return runCheck(options, argGens, propertyFn);
}

function runCheck(options, argGens, propertyFn) {
  // Return test function which runs testcheck and throws if it fails.
  return function () {
    // Build property
    var property = testcheck.property(argGens, propertyFn.bind(this));

    // Run testcheck
    var checkResult = testcheck.check(property, options);

    // Report results
    if (checkResult.fail) {
      throw new CheckFailure(checkResult);
    }
  }
}

function CheckFailure(checkResult) {
  var shrunk = checkResult.shrunk;
  var args = shrunk ? shrunk.smallest : checkResult.fail;
  var result = shrunk ? shrunk.result : checkResult.result;
  this.check = checkResult
  this.message = printArgs(args) + ' => ' + String(result);

  if (result instanceof Error) {
    // Edit stack
    this.stack = this.name + ': ' + this.message + '\n' + stackFrames(result);

    // Copy over other properties
    for (var p in result) {
      if (p !== 'message' && result.hasOwnProperty(p)) {
        this[p] = result[p]
      }
    }
  }
}

CheckFailure.prototype = Object.create(Error.prototype);
CheckFailure.prototype.name = 'CheckFailure';
CheckFailure.prototype.constructor = CheckFailure;

function printArgs(args) {
  return '(' + require('util').inspect(args).slice(1, -1) + ')'
}

function stackFrames(error) {
  return String(error.stack).split('\n').slice(1).join('\n')
}

exports.install = install;
exports.check = check;
exports.gen = testcheck.gen;
