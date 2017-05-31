"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDependencies = exports.specInterpreterDependencies = exports.emscriptenDependencies = exports.llvmDependencies = exports.csmithDependencies = undefined;

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
    var cache, getPaths, rPath;
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

            getPaths = function getPaths() {
              var dev15Paths = ["15.0"].map(function (version) {
                var possiblePaths = [{ root: _path2.default.resolve(process.env.ProgramFiles, "Microsoft Visual Studio", "2017"), rest: ["msbuild", version, "bin/x86"] }, { root: _path2.default.resolve(process.env["ProgramFiles(x86)"], "Microsoft Visual Studio", "2017"), rest: ["msbuild", version, "bin"] }, { root: _path2.default.resolve(process.env["ProgramFiles(x86)"], "Microsoft Visual Studio", "2017"), rest: ["msbuild", version, "bin/amd64"] }];
                return possiblePaths.reduce(function (allPaths, info) {
                  try {
                    var content = _fsExtra2.default.readdirSync(info.root);
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                      for (var _iterator = content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var dir = _step.value;

                        allPaths.push(_path2.default.join.apply(_path2.default, [info.root, dir].concat(_toConsumableArray(info.rest))));
                      }
                    } catch (err) {
                      _didIteratorError = true;
                      _iteratorError = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                          _iterator.return();
                        }
                      } finally {
                        if (_didIteratorError) {
                          throw _iteratorError;
                        }
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                  return allPaths;
                }, []).join(";");
              }).join(";");

              var oldDevPaths = ["14.0", "12.0", "10.0"].map(function (version) {
                return [_path2.default.resolve(process.env.ProgramFiles, "msbuild", version, "bin/x86"), _path2.default.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin"), _path2.default.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin/amd64")].join(";");
              }).join(";");
              return dev15Paths + oldDevPaths;
            };

            _context2.next = 8;
            return fromPath("msbuild.exe");

          case 8:
            _context2.t0 = _context2.sent;

            if (_context2.t0) {
              _context2.next = 13;
              break;
            }

            _context2.next = 12;
            return fromPath("msbuild.exe", { path: getPaths() });

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
            _context3.next = 5;
            return _which2.default.async("cmake");

          case 5:
            _context3.t1 = _context3.sent;
            dependencies = {
              msbuild: _context3.t0,
              cmake: _context3.t1
            };

            if (!_init.isWindows) {
              _context3.next = 11;
              break;
            }

            dependencies.m4 = _path2.default.join(_init.thirdParties.m4, "m4.exe");
            _context3.next = 14;
            break;

          case 11:
            _context3.next = 13;
            return _which2.default.async("m4");

          case 13:
            dependencies.m4 = _context3.sent;

          case 14:
            return _context3.abrupt("return", dependencies);

          case 15:
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
    var locations, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, loc, _arr, _i, bin, python;

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
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context6.prev = 7;
            _iterator2 = locations[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context6.next = 32;
              break;
            }

            loc = _step2.value;
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
            _iteratorNormalCompletion2 = true;
            _context6.next = 9;
            break;

          case 32:
            _context6.next = 38;
            break;

          case 34:
            _context6.prev = 34;
            _context6.t2 = _context6["catch"](7);
            _didIteratorError2 = true;
            _iteratorError2 = _context6.t2;

          case 38:
            _context6.prev = 38;
            _context6.prev = 39;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 41:
            _context6.prev = 41;

            if (!_didIteratorError2) {
              _context6.next = 44;
              break;
            }

            throw _iteratorError2;

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
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.t0 = emCache;

            if (_context7.t0) {
              _context7.next = 5;
              break;
            }

            _context7.next = 4;
            return emscriptenDependenciesInternal();

          case 4:
            _context7.t0 = _context7.sent;

          case 5:
            emCache = _context7.t0;
            return _context7.abrupt("return", emCache);

          case 7:
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

var emscriptenDependenciesInternal = function () {
  var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
    var python, emscriptenRoot, emcc, empp, runFn;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return searchPython();

          case 2:
            python = _context8.sent;
            emscriptenRoot = _init.thirdParties.emscripten;
            emcc = _path2.default.join(emscriptenRoot, "emcc.py");
            empp = _path2.default.join(emscriptenRoot, "em++.py");

            runFn = function runFn(bin) {
              return function () {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var proc = (0, _child_process.spawn)(python, [bin].concat(_toConsumableArray(args)), _extends({
                  stdio: "inherit",
                  env: _extends({}, process.env, {
                    // Change home to tell emscripten to use our .emscripten file
                    HOME: _init.outputDir,
                    USERPROFILE: _init.outputDir
                  })
                }, opt));
                return (0, _utils.waitUntilDone)(proc);
              };
            };

            return _context8.abrupt("return", {
              python: python,
              emcc: emcc,
              empp: empp,
              runEmcc: runFn(emcc),
              runEmpp: runFn(empp)
            });

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function emscriptenDependenciesInternal() {
    return _ref8.apply(this, arguments);
  };
}();

var specInterpreterDependencies = exports.specInterpreterDependencies = function () {
  var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.t0 = specCache;

            if (_context9.t0) {
              _context9.next = 5;
              break;
            }

            _context9.next = 4;
            return specInterpreterDependenciesInternal();

          case 4:
            _context9.t0 = _context9.sent;

          case 5:
            specCache = _context9.t0;
            return _context9.abrupt("return", specCache);

          case 7:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function specInterpreterDependencies() {
    return _ref9.apply(this, arguments);
  };
}();

var specInterpreterDependenciesInternal = function () {
  var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!_init.isWindows) {
              _context10.next = 2;
              break;
            }

            return _context10.abrupt("return", {
              cmd: "cmd"
            });

          case 2:
            _context10.next = 4;
            return _which2.default.async("make");

          case 4:
            _context10.t0 = _context10.sent;
            return _context10.abrupt("return", {
              make: _context10.t0
            });

          case 6:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function specInterpreterDependenciesInternal() {
    return _ref10.apply(this, arguments);
  };
}();

var generateDependencies = exports.generateDependencies = function () {
  var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.t0 = genDepCache;

            if (_context11.t0) {
              _context11.next = 5;
              break;
            }

            _context11.next = 4;
            return generateDependenciesInternal();

          case 4:
            _context11.t0 = _context11.sent;

          case 5:
            genDepCache = _context11.t0;
            return _context11.abrupt("return", genDepCache);

          case 7:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function generateDependencies() {
    return _ref11.apply(this, arguments);
  };
}();

var generateDependenciesInternal = function () {
  var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
    var wasmExe, csmithExe, clangExe;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return fromPath("wasm");

          case 2:
            _context12.t0 = _context12.sent;

            if (_context12.t0) {
              _context12.next = 7;
              break;
            }

            _context12.next = 6;
            return _which2.default.async("wasm", { path: _init.binDirectory.spec });

          case 6:
            _context12.t0 = _context12.sent;

          case 7:
            wasmExe = _context12.t0;
            _context12.next = 10;
            return fromPath("csmith");

          case 10:
            _context12.t1 = _context12.sent;

            if (_context12.t1) {
              _context12.next = 15;
              break;
            }

            _context12.next = 14;
            return _which2.default.async("csmith", { path: _init.binDirectory.csmith });

          case 14:
            _context12.t1 = _context12.sent;

          case 15:
            csmithExe = _context12.t1;
            _context12.next = 18;
            return fromPath("clang");

          case 18:
            _context12.t2 = _context12.sent;

            if (_context12.t2) {
              _context12.next = 23;
              break;
            }

            _context12.next = 22;
            return _which2.default.async("clang", { path: _init.binDirectory.llvm });

          case 22:
            _context12.t2 = _context12.sent;

          case 23:
            clangExe = _context12.t2;
            _context12.t3 = _extends;
            _context12.t4 = {
              wasm: wasmExe,
              csmith: csmithExe,
              clang: clangExe
            };
            _context12.next = 28;
            return emscriptenDependencies();

          case 28:
            _context12.t5 = _context12.sent;
            return _context12.abrupt("return", (0, _context12.t3)(_context12.t4, _context12.t5));

          case 30:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function generateDependenciesInternal() {
    return _ref12.apply(this, arguments);
  };
}();

var _init = require("./init");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _child_process = require("child_process");

var _utils = require("./utils");

var _which = require("which");

var _which2 = _interopRequireDefault(_which);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var msbuildCache = void 0;

var pythonCache = void 0;

var emCache = void 0;

var specCache = void 0;


var genDepCache = void 0;