var testcheck = require('testcheck');

function install(globalObj) {
  globalObj = globalObj || global || window;
  //
  console.log(globalObj);
}

// ...

exports.install = install;
