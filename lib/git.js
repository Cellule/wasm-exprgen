"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkSubmodules = undefined;

var checkSubmodules = exports.checkSubmodules = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var clangPath, symlink, isSymlinked, toolClangPath;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            clangPath = _init.thirdParties.clang;
            symlink = _path2.default.join(_init.thirdParties.llvm, "tools/clang");
            isSymlinked = false;
            _context.prev = 3;
            _context.next = 6;
            return _fsExtra2.default.realpathAsync(symlink);

          case 6:
            toolClangPath = _context.sent;

            isSymlinked = clangPath === toolClangPath;
            _context.next = 14;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);

            if (!(_context.t0.code !== "ENOENT")) {
              _context.next = 14;
              break;
            }

            throw _context.t0;

          case 14:
            if (isSymlinked) {
              _context.next = 28;
              break;
            }

            console.log("Creating symlink " + clangPath + " => " + symlink);
            _context.prev = 16;
            _context.next = 19;
            return _fsExtra2.default.ensureSymlinkAsync(clangPath, symlink, "dir");

          case 19:
            _context.next = 28;
            break;

          case 21:
            _context.prev = 21;
            _context.t1 = _context["catch"](16);

            if (!(_context.t1.code === "EPERM")) {
              _context.next = 27;
              break;
            }

            throw new Error("You need to be administrator to create a symlink.\nEither rerun with administrative priviledges, create symlink manually or copy clang to fastcomp tools");

          case 27:
            throw _context.t1;

          case 28:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 10], [16, 21]]);
  }));

  return function checkSubmodules() {
    return _ref.apply(this, arguments);
  };
}();

var _init = require("./init");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }