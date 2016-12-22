"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkSubmodules = undefined;

var checkSubmodules = exports.checkSubmodules = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var repo, submodules, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, name, status, submodule, fastcomp, clang, fastCompPath, clangPath, symlink, isSymlinked, toolClangPath;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _nodegit.Repository.open(_init.rootDir);

          case 2:
            repo = _context.sent;
            submodules = ["clang", "csmith", "emscripten", "emscripten-fastcomp"];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 7;
            _iterator = submodules[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 24;
              break;
            }

            name = _step.value;
            _context.next = 13;
            return _nodegit.Submodule.status(repo, name, _nodegit.Submodule.IGNORE.NONE);

          case 13:
            status = _context.sent;

            if (!(status & _nodegit.Submodule.STATUS.WD_UNINITIALIZED)) {
              _context.next = 21;
              break;
            }

            console.log("Initializing " + name);
            _context.next = 18;
            return _nodegit.Submodule.lookup(repo, name);

          case 18:
            submodule = _context.sent;
            _context.next = 21;
            return submodule.update(1, _nodegit.Submodule.UPDATE.CHECKOUT);

          case 21:
            _iteratorNormalCompletion = true;
            _context.next = 9;
            break;

          case 24:
            _context.next = 30;
            break;

          case 26:
            _context.prev = 26;
            _context.t0 = _context["catch"](7);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 30:
            _context.prev = 30;
            _context.prev = 31;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 33:
            _context.prev = 33;

            if (!_didIteratorError) {
              _context.next = 36;
              break;
            }

            throw _iteratorError;

          case 36:
            return _context.finish(33);

          case 37:
            return _context.finish(30);

          case 38:
            console.log("All submodules initialized");

            _context.next = 41;
            return _nodegit.Submodule.lookup(repo, "emscripten-fastcomp");

          case 41:
            fastcomp = _context.sent;
            _context.next = 44;
            return _nodegit.Submodule.lookup(repo, "clang");

          case 44:
            clang = _context.sent;
            fastCompPath = _path2.default.join(_init.rootDir, fastcomp.path());
            clangPath = _path2.default.join(_init.rootDir, clang.path());
            symlink = _path2.default.join(fastCompPath, "tools/clang");
            isSymlinked = false;
            _context.prev = 49;
            _context.next = 52;
            return _fsExtra2.default.realpathAsync(symlink);

          case 52:
            toolClangPath = _context.sent;

            isSymlinked = clangPath === toolClangPath;
            _context.next = 60;
            break;

          case 56:
            _context.prev = 56;
            _context.t1 = _context["catch"](49);

            if (!(_context.t1.code !== "ENOENT")) {
              _context.next = 60;
              break;
            }

            throw _context.t1;

          case 60:
            if (isSymlinked) {
              _context.next = 74;
              break;
            }

            console.log("Creating symlink " + clangPath + " => " + symlink);
            _context.prev = 62;
            _context.next = 65;
            return _fsExtra2.default.ensureSymlinkAsync(clangPath, symlink, "dir");

          case 65:
            _context.next = 74;
            break;

          case 67:
            _context.prev = 67;
            _context.t2 = _context["catch"](62);

            if (!(_context.t2.code === "EPERM")) {
              _context.next = 73;
              break;
            }

            console.warn("You need to be administrator to create a symlink.\nEither rerun with administrative priviledges, create symlink manually or copy clang to fastcomp tools");
            _context.next = 74;
            break;

          case 73:
            throw _context.t2;

          case 74:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[7, 26, 30, 38], [31,, 33, 37], [49, 56], [62, 67]]);
  }));

  return function checkSubmodules() {
    return _ref.apply(this, arguments);
  };
}();

var _init = require("./init");

var _nodegit = require("nodegit");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }