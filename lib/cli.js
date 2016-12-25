"use strict";

var _yargs = require("yargs");

var _yargs2 = _interopRequireDefault(_yargs);

var _generate = require("./generate");

var _generate2 = _interopRequireDefault(_generate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_yargs2.default.command({
  command: "gen",
  desc: "generate a random WebAssembly test file",
  //builder: (yargs) => yargs.default("value", "true"),
  handler: function handler(argv) {
    (0, _generate2.default)().then(function () {
      return console.log("test generated");
    }, console.error);
  }
}).demand(1).argv;