var testcheck = require('testcheck');

function install(globalObj) {
  globalObj = globalObj || global || window;
  if (!globalObj || !globalObj.jasmine) {
    throw new Error('Make sure install is called after jasmine is available.');
  }
  var jasmine = globalObj.jasmine;

  globalObj.gen = testcheck.gen;
  globalObj.check = {
    xit: function check_xit(specName) {
      return jasmine.getEnv().xit(specName);
    },
    it: function check_it(specName, argGens, options, propertyFn) {
      if (!propertyFn) {
        propertyFn = options;
        options = {};
      }

      var thisArg = this;

      var property = testcheck.property(argGens, function() {
        try {
          propertyFn.apply(thisArg, arguments);
        } catch (expectationException) {
          return false;
        }
        return true;
      });

      var result = testcheck.check(property, options);

      // TODO
    }
  };
}

exports.install = install;
