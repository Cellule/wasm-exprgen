"use strict";

var _git = require("./git");

var _dependencies = require("./dependencies");

(0, _git.checkSubmodules)().then(_dependencies.emscriptenDependencies).then(function (_ref) {
  var python = _ref.python;

  console.log(python);
}).catch(function (err) {
  return console.error(err);
});