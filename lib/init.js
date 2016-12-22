"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootDir = undefined;

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _which = require("which");

var _which2 = _interopRequireDefault(_which);

var _child_process = require("child_process");

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_fsExtra2.default);
_which2.default.async = _bluebird2.default.promisify(_which2.default);
_bluebird2.default.promisifyAll(_child_process2.default);

var rootDir = exports.rootDir = _path2.default.join(__dirname, "..");