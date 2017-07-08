"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.regen = exports.generate = undefined;

var _generate = require("./generate");

var _generate2 = _interopRequireDefault(_generate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.generate = _generate2.default;
exports.regen = _generate.compileFromSource;