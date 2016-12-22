"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDependencies = exports.emscriptenDependencies = exports.llvmDependencies = exports.csmithDependencies = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var fromPath = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bin) {
    var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var rPath;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _which2.default.async(bin, opt);

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

  return function fromPath(_x) {
    return _ref.apply(this, arguments);
  };
}();

var searchForMsBuild = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var cache, paths, rPath;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (_init.isWindows) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return", null);

          case 2:
            if (!msbuildCache) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return", msbuildCache);

          case 4:
            cache = function cache(p) {
              msbuildCache = p;
              console.log("MsBuild path: " + p);
              return msbuildCache;
            };

            paths = ["14.0", "12.0", "10.0"].map(function (version) {
              return [_path2.default.resolve(process.env.ProgramFiles, "msbuild", version, "bin/x86"), _path2.default.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin"), _path2.default.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin/amd64")].join(";");
            }).join(";");
            _context2.next = 8;
            return fromPath("msbuild.exe");

          case 8:
            _context2.t0 = _context2.sent;

            if (_context2.t0) {
              _context2.next = 13;
              break;
            }

            _context2.next = 12;
            return fromPath("msbuild.exe", { path: paths });

          case 12:
            _context2.t0 = _context2.sent;

          case 13:
            rPath = _context2.t0;

            if (!rPath) {
              _context2.next = 16;
              break;
            }

            return _context2.abrupt("return", cache(rPath));

          case 16:
            throw new Error("MsBuild is missing");

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function searchForMsBuild() {
    return _ref2.apply(this, arguments);
  };
}();

var csmithDependencies = exports.csmithDependencies = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var dependencies;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return searchForMsBuild();

          case 2:
            _context3.t0 = _context3.sent;
            dependencies = {
              msbuild: _context3.t0
            };

            if (!_init.isWindows) {
              _context3.next = 8;
              break;
            }

            dependencies.m4 = _path2.default.join(_init.rootDir, "third_party", "m4.exe");
            _context3.next = 11;
            break;

          case 8:
            _context3.next = 10;
            return _which2.default.async("m4");

          case 10:
            dependencies.m4 = _context3.sent;

          case 11:
            return _context3.abrupt("return", dependencies);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function csmithDependencies() {
    return _ref3.apply(this, arguments);
  };
}();

var llvmDependencies = exports.llvmDependencies = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var dependencies;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _which2.default.async("cmake");

          case 2:
            _context4.t0 = _context4.sent;
            _context4.next = 5;
            return searchForMsBuild();

          case 5:
            _context4.t1 = _context4.sent;

            if (!_init.isWindows) {
              _context4.next = 10;
              break;
            }

            _context4.t2 = null;
            _context4.next = 13;
            break;

          case 10:
            _context4.next = 12;
            return _which2.default.async("make");

          case 12:
            _context4.t2 = _context4.sent;

          case 13:
            _context4.t3 = _context4.t2;
            dependencies = {
              cmake: _context4.t0,
              msbuild: _context4.t1,
              make: _context4.t3
            };
            return _context4.abrupt("return", dependencies);

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function llvmDependencies() {
    return _ref4.apply(this, arguments);
  };
}();

var validatePythonVersion = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(python) {
    var proc, stdout, version;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!python) {
              _context5.next = 21;
              break;
            }

            _context5.prev = 1;
            proc = (0, _child_process.spawn)(python, ["--version"]);
            stdout = "";

            proc.stdout.on("data", function (data) {
              stdout += data;
            });
            proc.stderr.on("data", function (data) {
              stdout += data;
            });
            _context5.next = 8;
            return (0, _utils.waitUntilDone)(proc);

          case 8:
            _context5.prev = 8;
            version = parseFloat(/python (\d+\.\d+)/ig.exec(stdout)[1]);

            if (!(version >= 2.7 && version < 3)) {
              _context5.next = 12;
              break;
            }

            return _context5.abrupt("return", python);

          case 12:
            _context5.next = 16;
            break;

          case 14:
            _context5.prev = 14;
            _context5.t0 = _context5["catch"](8);

          case 16:
            _context5.next = 21;
            break;

          case 18:
            _context5.prev = 18;
            _context5.t1 = _context5["catch"](1);

            console.error(_context5.t1);

          case 21:
            return _context5.abrupt("return", null);

          case 22:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[1, 18], [8, 14]]);
  }));

  return function validatePythonVersion(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

var searchPython = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
    var locations, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, loc, _arr, _i, bin, python;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!pythonCache) {
              _context6.next = 2;
              break;
            }

            return _context6.abrupt("return", pythonCache);

          case 2:
            locations = [undefined, // Use current path
            process.env.PYTHON];

            if (_init.isWindows) {
              locations.push("C:\\Python27");
            }
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context6.prev = 7;
            _iterator = locations[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context6.next = 32;
              break;
            }

            loc = _step.value;
            _arr = ["python", "python2"];
            _i = 0;

          case 13:
            if (!(_i < _arr.length)) {
              _context6.next = 29;
              break;
            }

            bin = _arr[_i];
            _context6.t0 = validatePythonVersion;
            _context6.next = 18;
            return fromPath(bin, { path: loc });

          case 18:
            _context6.t1 = _context6.sent;
            _context6.next = 21;
            return (0, _context6.t0)(_context6.t1);

          case 21:
            python = _context6.sent;

            if (!python) {
              _context6.next = 26;
              break;
            }

            pythonCache = python;
            console.log("Python path: " + python);
            return _context6.abrupt("return", python);

          case 26:
            _i++;
            _context6.next = 13;
            break;

          case 29:
            _iteratorNormalCompletion = true;
            _context6.next = 9;
            break;

          case 32:
            _context6.next = 38;
            break;

          case 34:
            _context6.prev = 34;
            _context6.t2 = _context6["catch"](7);
            _didIteratorError = true;
            _iteratorError = _context6.t2;

          case 38:
            _context6.prev = 38;
            _context6.prev = 39;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 41:
            _context6.prev = 41;

            if (!_didIteratorError) {
              _context6.next = 44;
              break;
            }

            throw _iteratorError;

          case 44:
            return _context6.finish(41);

          case 45:
            return _context6.finish(38);

          case 46:
            throw new Error("Python 2 is missing");

          case 47:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[7, 34, 38, 46], [39,, 41, 45]]);
  }));

  return function searchPython() {
    return _ref6.apply(this, arguments);
  };
}();

var emscriptenDependencies = exports.emscriptenDependencies = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
    var python, emscriptenRoot, emcc, empp, runFn;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return searchPython();

          case 2:
            python = _context7.sent;
            emscriptenRoot = _path2.default.join(_init.rootDir, "third_party", "emscripten");
            emcc = _path2.default.join(emscriptenRoot, "emcc.py");
            empp = _path2.default.join(emscriptenRoot, "em++.py");

            runFn = function runFn(bin) {
              return function () {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var proc = (0, _child_process.spawn)(python, [bin].concat(_toConsumableArray(args)), _extends({
                  stdio: "inherit"
                }, opt));
                return (0, _utils.waitUntilDone)(proc);
              };
            };

            return _context7.abrupt("return", {
              python: python,
              emcc: emcc,
              empp: empp,
              runEmcc: runFn(emcc),
              runEmpp: runFn(empp)
            });

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function emscriptenDependencies() {
    return _ref7.apply(this, arguments);
  };
}();

var generateDependencies = exports.generateDependencies = function () {
  var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
    var csmithExe, clangExe;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return fromPath("csmith");

          case 2:
            _context8.t0 = _context8.sent;

            if (_context8.t0) {
              _context8.next = 7;
              break;
            }

            _context8.next = 6;
            return _which2.default.async("csmith", { path: _init.binDirectory.csmith });

          case 6:
            _context8.t0 = _context8.sent;

          case 7:
            csmithExe = _context8.t0;
            _context8.next = 10;
            return fromPath("clang");

          case 10:
            _context8.t1 = _context8.sent;

            if (_context8.t1) {
              _context8.next = 15;
              break;
            }

            _context8.next = 14;
            return _which2.default.async("clang", { path: _init.binDirectory.llvm });

          case 14:
            _context8.t1 = _context8.sent;

          case 15:
            clangExe = _context8.t1;
            _context8.t2 = _extends;
            _context8.t3 = {
              csmith: csmithExe,
              clang: clangExe
            };
            _context8.next = 20;
            return emscriptenDependencies();

          case 20:
            _context8.t4 = _context8.sent;
            return _context8.abrupt("return", (0, _context8.t2)(_context8.t3, _context8.t4));

          case 22:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function generateDependencies() {
    return _ref8.apply(this, arguments);
  };
}();

var _init = require("./init");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _child_process = require("child_process");

var _utils = require("./utils");

var _which = require("which");

var _which2 = _interopRequireDefault(_which);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var msbuildCache = void 0;

var pythonCache = void 0;