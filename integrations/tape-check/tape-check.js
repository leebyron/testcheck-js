var testcheck = require('testcheck');

exports.gen = testcheck.gen;
exports.check = check;

function check(/* [options,] ...args, propertyFn */) {
  // Gather arguments:
  // - options, gen, gen, propFn
  // - gen, gen, propFn
  var i = 0;
  var n = arguments.length - 1;
  var options = arguments[i].constructor === Object ? arguments[i++] : {};
  var propertyFn = arguments[n];
  var argGens = [];
  for (; i < n; i++) {
    argGens.push(arguments[i]);
  }

  return function (test) {

    // Inside the property, collect assertions rather than emitting them.
    var testAndListen = {
      __proto__: test.__proto__,
      plan: planWrap,
      _end: endWrap,
      _assert: assertWrap,
    };

    // Build property
    var fn = propertyFn.bind(testAndListen, testAndListen);
    var property = testcheck.property(argGens, function testcheck$property() {
      // Reset assertions and plan before every run.
      testAndListen._ok = true;
      testAndListen._plan = undefined;
      testAndListen._assertions = [];
      testAndListen.calledEnd = false;

      var result = fn.apply(null, arguments);

      // Check plan after every run.
      testAndListen._end();
      return testAndListen._ok;
    });

    // Run testcheck
    var checkResult = testcheck.check(property, options);

    // Report results
    if (checkResult.fail) {
      var shrunk = checkResult.shrunk;
      var args = shrunk ? shrunk.smallest : checkResult.fail;

      // Swizzle test.emit to append args when emitting a result.
      var originalEmit = test.emit;
      test.emit = function (name, data) {
        if (name === 'result') {
          data.name += printArgs(args);
        }
        originalEmit.call(test, name, data);
      }

      // Re-run test with failing arguments outside the property checking loop.
      propertyFn.apply(test, [test].concat(args));
    } else {
      // Report all assertions from the last successful run.
      testAndListen._assertions.forEach(function (assertion) {
        test._assert(assertion[0], assertion[1])
      })
      test.end()
    }
  }
}

function planWrap(num) {
  this._plan = num;
}

function endWrap() {
  if (this._plan === undefined ? !this.calledEnd : this._plan !== this._assertions.length) {
    this._assert(false);
  }
}

function assertWrap(ok, opts) {
  this._assertions.push([ ok, opts ]);
  this._ok = this._ok && ok;
}

function printArgs(args) {
  return ' (' + require('util').inspect(args, { depth: null }).slice(1, -1) + ')'
}
