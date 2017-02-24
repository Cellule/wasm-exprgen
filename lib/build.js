"use strict";

var buildCSmith = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _this = this;

    var _ref2, msbuild, make, m4, csmithBinDir, csmithPath, incPath, output, binSrc, vcproj, procConf, procMake, incSrcPath, m4Files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

    return regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _dependencies.csmithDependencies)();

          case 2:
            _ref2 = _context2.sent;
            msbuild = _ref2.msbuild;
            make = _ref2.make;
            m4 = _ref2.m4;
            csmithBinDir = _init.buildDirectory.csmith;
            _context2.next = 9;
            return _fsExtra2.default.ensureDirAsync(csmithBinDir);

          case 9:
            console.log("Starting CSmith build");

            csmithPath = _init.thirdParties.csmith;
            incPath = _path2.default.join(csmithBinDir, "inc");
            output = void 0;
            binSrc = void 0;

            if (!msbuild) {
              _context2.next = 23;
              break;
            }

            vcproj = _path2.default.join(csmithPath, "src", "csmith.vcxproj");
            _context2.next = 18;
            return (0, _child_process.execFileAsync)(msbuild, [vcproj, "/p:Configuration=Release"]);

          case 18:

            output = _path2.default.join(csmithBinDir, "csmith.exe");
            binSrc = _path2.default.join(csmithPath, "src", "Release", "csmith.exe");
            console.log("CSmith output: " + output);
            _context2.next = 31;
            break;

          case 23:
            procConf = (0, _child_process.spawn)(_path2.default.join(csmithPath, "configure"), [], {
              cwd: csmithPath,
              stdio: "inherit"
            });
            _context2.next = 26;
            return (0, _utils.waitUntilDone)(procConf);

          case 26:
            procMake = (0, _child_process.spawn)(make, [], {
              cwd: csmithPath,
              stdio: "inherit"
            });
            _context2.next = 29;
            return (0, _utils.waitUntilDone)(procMake);

          case 29:
            output = _path2.default.join(csmithBinDir, "csmith");
            binSrc = _path2.default.join(csmithPath, "src", "csmith");

          case 31:
            incSrcPath = _path2.default.join(csmithPath, "runtime");
            _context2.next = 34;
            return _fsExtra2.default.emptyDirAsync(incPath);

          case 34:
            _context2.next = 36;
            return _fsExtra2.default.copyAsync(incSrcPath, incPath);

          case 36:
            _context2.next = 38;
            return _fsExtra2.default.copyAsync(binSrc, output, { clobber: true });

          case 38:
            if (!msbuild) {
              _context2.next = 68;
              break;
            }

            _context2.next = 41;
            return _fsExtra2.default.readdirAsync(incPath);

          case 41:
            _context2.t0 = function (file) {
              return _path2.default.extname(file) === ".m4";
            };

            m4Files = _context2.sent.filter(_context2.t0);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 46;
            _loop = regeneratorRuntime.mark(function _loop() {
              var m4File, filename, stream, proc;
              return regeneratorRuntime.wrap(function _loop$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      m4File = _step.value;
                      filename = _path2.default.basename(m4File, ".m4");
                      stream = _fsExtra2.default.createWriteStream(_path2.default.join(incPath, filename + ".h"));
                      _context.next = 5;
                      return new Promise(function (r) {
                        return stream.on("open", r);
                      });

                    case 5:
                      proc = (0, _child_process.spawn)(m4, [_path2.default.join(incPath, m4File)], {
                        stdio: [stream, stream, stream]
                      });
                      _context.next = 8;
                      return (0, _utils.waitUntilDone)(proc);

                    case 8:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _loop, _this);
            });
            _iterator = m4Files[Symbol.iterator]();

          case 49:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 54;
              break;
            }

            return _context2.delegateYield(_loop(), "t1", 51);

          case 51:
            _iteratorNormalCompletion = true;
            _context2.next = 49;
            break;

          case 54:
            _context2.next = 60;
            break;

          case 56:
            _context2.prev = 56;
            _context2.t2 = _context2["catch"](46);
            _didIteratorError = true;
            _iteratorError = _context2.t2;

          case 60:
            _context2.prev = 60;
            _context2.prev = 61;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 63:
            _context2.prev = 63;

            if (!_didIteratorError) {
              _context2.next = 66;
              break;
            }

            throw _iteratorError;

          case 66:
            return _context2.finish(63);

          case 67:
            return _context2.finish(60);

          case 68:
            console.log("CSmith output: " + output);

          case 69:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[46, 56, 60, 68], [61,, 63, 67]]);
  }));

  return function buildCSmith() {
    return _ref.apply(this, arguments);
  };
}();

var buildLLVM = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var clangPath, clangDestPath, _ref4, cmake, msbuild, make, buildDir, llvmPath, solution, proc, _proc;

    return regeneratorRuntime.wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            clangPath = _init.thirdParties.clang;
            clangDestPath = _path2.default.join(_init.thirdParties.llvm, "tools/clang");

            console.log("Copying " + clangPath + " => " + clangDestPath);
            _context3.next = 5;
            return _fsExtra2.default.copyAsync(clangPath, clangDestPath);

          case 5:
            _context3.next = 7;
            return (0, _dependencies.llvmDependencies)();

          case 7:
            _ref4 = _context3.sent;
            cmake = _ref4.cmake;
            msbuild = _ref4.msbuild;
            make = _ref4.make;

            console.log("Starting LLVM build. This might take a while...");

            buildDir = _init.buildDirectory.llvm;
            _context3.next = 15;
            return _fsExtra2.default.ensureDirAsync(buildDir);

          case 15:
            llvmPath = _init.thirdParties.llvm;

            console.log("Running cmake");
            _context3.next = 19;
            return (0, _child_process.execFileAsync)(cmake, [llvmPath, "-DCMAKE_BUILD_TYPE=Release", "-DLLVM_TARGETS_TO_BUILD=X86;JSBackend", "-DLLVM_INCLUDE_EXAMPLES=OFF", "-DLLVM_INCLUDE_TESTS=OFF", "-DCLANG_INCLUDE_EXAMPLES=OFF", "-DCLANG_INCLUDE_TESTS=OFF"], {
              cwd: buildDir
            });

          case 19:
            if (!msbuild) {
              _context3.next = 27;
              break;
            }

            console.log("Running msbuild");
            solution = _path2.default.join(buildDir, "LLVM.sln");
            proc = (0, _child_process.spawn)(msbuild, [solution, "/p:Configuration=Release"], {
              stdio: "inherit"
            });
            _context3.next = 25;
            return (0, _utils.waitUntilDone)(proc);

          case 25:
            _context3.next = 31;
            break;

          case 27:
            console.log("Running make");
            _proc = (0, _child_process.spawn)(make, ["-j4"], {
              cwd: buildDir,
              stdio: "inherit"
            });
            _context3.next = 31;
            return (0, _utils.waitUntilDone)(_proc);

          case 31:
            console.log("LLVM output: " + _init.binDirectory.llvm);

          case 32:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee2, this);
  }));

  return function buildLLVM() {
    return _ref3.apply(this, arguments);
  };
}();

var prepareEmscriptenConfig = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var _ref6, python, cleanPath, tmpDir, file, emscriptenFile;

    return regeneratorRuntime.wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _dependencies.emscriptenDependencies)();

          case 2:
            _ref6 = _context4.sent;
            python = _ref6.python;

            cleanPath = function cleanPath(p) {
              return p.replace(/\\/g, "/");
            };

            tmpDir = _path2.default.join(_init.outputDir, "tmp");
            file = "\nEMSCRIPTEN_ROOT = '" + cleanPath(_init.thirdParties.emscripten) + "'\nLLVM_ROOT= '" + cleanPath(_init.binDirectory.llvm) + "'\nPYTHON = '" + cleanPath(python) + "'\nNODE_JS= '" + cleanPath(process.argv[0]) + "'\nTEMP_DIR = '" + cleanPath(tmpDir) + "'\nCOMPILER_ENGINE = NODE_JS\nJS_ENGINES = [NODE_JS]\n";
            _context4.next = 9;
            return _fsExtra2.default.ensureDirAsync(tmpDir);

          case 9:
            emscriptenFile = _path2.default.join(_init.outputDir, ".emscripten");
            _context4.next = 12;
            return _fsExtra2.default.outputFileAsync(emscriptenFile, file);

          case 12:
            console.log("Generated config file " + emscriptenFile);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee3, this);
  }));

  return function prepareEmscriptenConfig() {
    return _ref5.apply(this, arguments);
  };
}();

var buildSpecInterpreter = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var interpreterPath, _ref8, cmd, make, proc, _proc2;

    return regeneratorRuntime.wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            console.log("Starting Spec interpreter build");
            _context5.next = 3;
            return _fsExtra2.default.ensureDirAsync(_init.buildDirectory.spec);

          case 3:
            interpreterPath = _path2.default.join(_init.thirdParties.spec, "interpreter");
            _context5.next = 6;
            return (0, _dependencies.specInterpreterDependencies)();

          case 6:
            _ref8 = _context5.sent;
            cmd = _ref8.cmd;
            make = _ref8.make;

            if (!cmd) {
              _context5.next = 17;
              break;
            }

            proc = (0, _child_process.spawn)(cmd, ["/c", "winmake"], {
              cwd: interpreterPath
            });
            _context5.next = 13;
            return (0, _utils.waitUntilDone)(proc);

          case 13:
            _context5.next = 15;
            return _fsExtra2.default.copyAsync(_path2.default.join(interpreterPath, "wasm.exe"), _path2.default.join(_init.buildDirectory.spec, "wasm.exe"));

          case 15:
            _context5.next = 22;
            break;

          case 17:
            _proc2 = (0, _child_process.spawn)(make, [], {
              cwd: interpreterPath
            });
            _context5.next = 20;
            return (0, _utils.waitUntilDone)(_proc2);

          case 20:
            _context5.next = 22;
            return _fsExtra2.default.copyAsync(_path2.default.join(interpreterPath, "wasm"), _path2.default.join(_init.buildDirectory.spec, "wasm"));

          case 22:
            console.log("Wasm Spec output: " + _init.binDirectory.spec);

          case 23:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4, this);
  }));

  return function buildSpecInterpreter() {
    return _ref7.apply(this, arguments);
  };
}();

var _init = require("./init");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _dependencies = require("./dependencies");

var _child_process = require("child_process");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

buildSpecInterpreter().then(buildCSmith).then(buildLLVM).then(prepareEmscriptenConfig).catch(function (err) {
  return console.error(err);
});