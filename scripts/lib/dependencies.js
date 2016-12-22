"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fastCompDependencies = exports.csmithDependencies = undefined;

var checkBinary = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bin) {
    var rPath;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _which2.default.async(bin);

          case 3:
            rPath = _context.sent;
            return _context.abrupt("return", rPath);

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);

            if (!(_context.t0.message.indexOf("not found") === -1)) {
              _context.next = 11;
              break;
            }

            throw _context.t0;

          case 11:
            return _context.abrupt("return", null);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));

  return function checkBinary(_x) {
    return _ref.apply(this, arguments);
  };
}();

var fileExists = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(p) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _fsExtra2.default.statAsync(p);

          case 3:
            return _context2.abrupt("return", true);

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2["catch"](0);

          case 8:
            return _context2.abrupt("return", false);

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 6]]);
  }));

  return function fileExists(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var searchForMsBuild = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var cache, rPath, versions, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, version, paths, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, p, msbuildPath;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (isWindows) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return", null);

          case 2:
            if (!msbuildCache) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt("return", msbuildCache);

          case 4:
            cache = function cache(p) {
              msbuildCache = p;
              console.log("MsBuild path: " + p);
              return msbuildCache;
            };

            _context3.next = 7;
            return checkBinary("msbuild.exe");

          case 7:
            rPath = _context3.sent;

            if (!rPath) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt("return", cache(rPath));

          case 10:
            versions = ["14.0", "12.0", "10.0"];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context3.prev = 14;
            _iterator = versions[Symbol.iterator]();

          case 16:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context3.next = 51;
              break;
            }

            version = _step.value;
            paths = [_path2.default.resolve(process.env["ProgramFiles"], "msbuild", version, "bin/x86"), _path2.default.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin"), _path2.default.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin/amd64")];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context3.prev = 22;
            _iterator2 = paths[Symbol.iterator]();

          case 24:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context3.next = 34;
              break;
            }

            p = _step2.value;
            msbuildPath = _path2.default.join(p, "msbuild.exe");
            _context3.next = 29;
            return fileExists(msbuildPath);

          case 29:
            if (!_context3.sent) {
              _context3.next = 31;
              break;
            }

            return _context3.abrupt("return", cache(msbuildPath));

          case 31:
            _iteratorNormalCompletion2 = true;
            _context3.next = 24;
            break;

          case 34:
            _context3.next = 40;
            break;

          case 36:
            _context3.prev = 36;
            _context3.t0 = _context3["catch"](22);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t0;

          case 40:
            _context3.prev = 40;
            _context3.prev = 41;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 43:
            _context3.prev = 43;

            if (!_didIteratorError2) {
              _context3.next = 46;
              break;
            }

            throw _iteratorError2;

          case 46:
            return _context3.finish(43);

          case 47:
            return _context3.finish(40);

          case 48:
            _iteratorNormalCompletion = true;
            _context3.next = 16;
            break;

          case 51:
            _context3.next = 57;
            break;

          case 53:
            _context3.prev = 53;
            _context3.t1 = _context3["catch"](14);
            _didIteratorError = true;
            _iteratorError = _context3.t1;

          case 57:
            _context3.prev = 57;
            _context3.prev = 58;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 60:
            _context3.prev = 60;

            if (!_didIteratorError) {
              _context3.next = 63;
              break;
            }

            throw _iteratorError;

          case 63:
            return _context3.finish(60);

          case 64:
            return _context3.finish(57);

          case 65:
            throw new Error("MsBuild is missing");

          case 66:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[14, 53, 57, 65], [22, 36, 40, 48], [41,, 43, 47], [58,, 60, 64]]);
  }));

  return function searchForMsBuild() {
    return _ref3.apply(this, arguments);
  };
}();

var csmithDependencies = exports.csmithDependencies = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var dependencies;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return searchForMsBuild();

          case 2:
            _context4.t0 = _context4.sent;
            dependencies = {
              msbuild: _context4.t0
            };

            if (!isWindows) {
              _context4.next = 8;
              break;
            }

            dependencies.m4 = _path2.default.join(_init.rootDir, "third_party", "m4.exe");
            _context4.next = 11;
            break;

          case 8:
            _context4.next = 10;
            return _which2.default.async("m4");

          case 10:
            dependencies.m4 = _context4.sent;

          case 11:
            return _context4.abrupt("return", dependencies);

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function csmithDependencies() {
    return _ref4.apply(this, arguments);
  };
}();

var fastCompDependencies = exports.fastCompDependencies = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
    var dependencies;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _which2.default.async("cmake");

          case 2:
            _context5.t0 = _context5.sent;
            _context5.next = 5;
            return searchForMsBuild();

          case 5:
            _context5.t1 = _context5.sent;

            if (!isWindows) {
              _context5.next = 10;
              break;
            }

            _context5.t2 = null;
            _context5.next = 13;
            break;

          case 10:
            _context5.next = 12;
            return _which2.default.async("make");

          case 12:
            _context5.t2 = _context5.sent;

          case 13:
            _context5.t3 = _context5.t2;
            dependencies = {
              cmake: _context5.t0,
              msbuild: _context5.t1,
              make: _context5.t3
            };
            return _context5.abrupt("return", dependencies);

          case 16:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function fastCompDependencies() {
    return _ref5.apply(this, arguments);
  };
}();

var _init = require("./init");

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _which = require("which");

var _which2 = _interopRequireDefault(_which);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var isWindows = _os2.default.platform() === "win32";

var msbuildCache = void 0;