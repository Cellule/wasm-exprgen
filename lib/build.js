"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareEmscriptenConfig = undefined;

var buildCSmith = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _ref2, msbuild, cmake, m4, csmithBuildDir, csmithPath, vcproj, output;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _dependencies.csmithDependencies)();

          case 2:
            _ref2 = _context.sent;
            msbuild = _ref2.msbuild;
            cmake = _ref2.cmake;
            m4 = _ref2.m4;
            csmithBuildDir = _init.buildDirectory.csmith;
            _context.next = 9;
            return _fsExtra2.default.ensureDirAsync(csmithBuildDir);

          case 9:
            console.log("Starting CSmith build");
            csmithPath = _init.thirdParties.csmith;
            _context.next = 13;
            return (0, _child_process.execFileAsync)(cmake, [csmithPath], {
              cwd: csmithBuildDir,
              env: {
                path: _path2.default.dirname(msbuild) + ";" + _path2.default.dirname(m4) + ";" + process.env.path
              }
            });

          case 13:
            if (!msbuild) {
              _context.next = 19;
              break;
            }

            vcproj = _path2.default.join(csmithBuildDir, "csmith.sln");
            _context.next = 17;
            return (0, _child_process.execFileAsync)(msbuild, [vcproj, "/p:Configuration=Release"]);

          case 17:
            output = _path2.default.join(_init.binDirectory.csmith, "csmith.exe");

            console.log("CSmith output: " + output);

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function buildCSmith() {
    return _ref.apply(this, arguments);
  };
}();

var buildLLVM = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var clangPath, clangDestPath, _ref4, cmake, msbuild, make, buildDir, llvmPath, solution, proc, _proc;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            clangPath = _init.thirdParties.clang;
            clangDestPath = _path2.default.join(_init.thirdParties.llvm, "tools/clang");

            console.log("Copying " + clangPath + " => " + clangDestPath);
            _context2.next = 5;
            return _fsExtra2.default.copyAsync(clangPath, clangDestPath);

          case 5:
            _context2.next = 7;
            return (0, _dependencies.llvmDependencies)();

          case 7:
            _ref4 = _context2.sent;
            cmake = _ref4.cmake;
            msbuild = _ref4.msbuild;
            make = _ref4.make;

            console.log("Starting LLVM build. This might take a while...");

            buildDir = _init.buildDirectory.llvm;
            _context2.next = 15;
            return _fsExtra2.default.ensureDirAsync(buildDir);

          case 15:
            llvmPath = _init.thirdParties.llvm;

            console.log("Running cmake");
            _context2.next = 19;
            return (0, _child_process.execFileAsync)(cmake, [llvmPath, "-DCMAKE_BUILD_TYPE=Release", "-DLLVM_TARGETS_TO_BUILD=X86;JSBackend", "-DLLVM_INCLUDE_EXAMPLES=OFF", "-DLLVM_INCLUDE_TESTS=OFF", "-DCLANG_INCLUDE_EXAMPLES=OFF", "-DCLANG_INCLUDE_TESTS=OFF"], {
              cwd: buildDir,
              env: {
                path: _path2.default.dirname(msbuild) + ";" + process.env.path
              }
            });

          case 19:
            if (!msbuild) {
              _context2.next = 27;
              break;
            }

            console.log("Running msbuild");
            solution = _path2.default.join(buildDir, "LLVM.sln");
            proc = (0, _child_process.spawn)(msbuild, [solution, "/p:Configuration=Release"], {
              stdio: "inherit"
            });
            _context2.next = 25;
            return (0, _utils.waitUntilDone)(proc);

          case 25:
            _context2.next = 31;
            break;

          case 27:
            console.log("Running make");
            _proc = (0, _child_process.spawn)(make, ["-j4"], {
              cwd: buildDir,
              stdio: "inherit"
            });
            _context2.next = 31;
            return (0, _utils.waitUntilDone)(_proc);

          case 31:
            console.log("LLVM output: " + _init.binDirectory.llvm);

          case 32:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function buildLLVM() {
    return _ref3.apply(this, arguments);
  };
}();

var prepareEmscriptenConfig = exports.prepareEmscriptenConfig = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var _ref6, python, cleanPath, tmpDir, file, emscriptenFile;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _dependencies.emscriptenDependencies)();

          case 2:
            _ref6 = _context3.sent;
            python = _ref6.python;

            cleanPath = function cleanPath(p) {
              return p.replace(/\\/g, "/");
            };

            tmpDir = _path2.default.join(_init.outputDir, "tmp");
            file = "\nEMSCRIPTEN_ROOT = '" + cleanPath(_init.thirdParties.emscripten) + "'\nLLVM_ROOT= '" + cleanPath(_init.binDirectory.llvm) + "'\nPYTHON = '" + cleanPath(python) + "'\nNODE_JS= '" + cleanPath(process.argv[0]) + "'\nTEMP_DIR = '" + cleanPath(tmpDir) + "'\nCOMPILER_ENGINE = NODE_JS\nJS_ENGINES = [NODE_JS]\n";
            _context3.next = 9;
            return _fsExtra2.default.ensureDirAsync(tmpDir);

          case 9:
            emscriptenFile = _path2.default.join(_init.outputDir, ".emscripten");
            _context3.next = 12;
            return _fsExtra2.default.outputFileAsync(emscriptenFile, file);

          case 12:
            console.log("Generated config file " + emscriptenFile);

          case 13:
          case "end":
            return _context3.stop();
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

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log("Starting Spec interpreter build");
            _context4.next = 3;
            return _fsExtra2.default.ensureDirAsync(_init.buildDirectory.spec);

          case 3:
            interpreterPath = _path2.default.join(_init.thirdParties.spec, "interpreter");
            _context4.next = 6;
            return (0, _dependencies.specInterpreterDependencies)();

          case 6:
            _ref8 = _context4.sent;
            cmd = _ref8.cmd;
            make = _ref8.make;

            if (!cmd) {
              _context4.next = 17;
              break;
            }

            proc = (0, _child_process.spawn)(cmd, ["/c", "winmake"], {
              cwd: interpreterPath
            });
            _context4.next = 13;
            return (0, _utils.waitUntilDone)(proc);

          case 13:
            _context4.next = 15;
            return _fsExtra2.default.copyAsync(_path2.default.join(interpreterPath, "main", "main.d.byte"), _path2.default.join(_init.buildDirectory.spec, "wasm.exe"));

          case 15:
            _context4.next = 22;
            break;

          case 17:
            _proc2 = (0, _child_process.spawn)(make, [], {
              cwd: interpreterPath
            });
            _context4.next = 20;
            return (0, _utils.waitUntilDone)(_proc2);

          case 20:
            _context4.next = 22;
            return _fsExtra2.default.copyAsync(_path2.default.join(interpreterPath, "wasm"), _path2.default.join(_init.buildDirectory.spec, "wasm"));

          case 22:
            console.log("Wasm Spec output: " + _init.binDirectory.spec);

          case 23:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function buildSpecInterpreter() {
    return _ref7.apply(this, arguments);
  };
}();

exports.default = build;

var _init = require("./init");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _dependencies = require("./dependencies");

var _child_process = require("child_process");

var _utils = require("./utils");

var _generate = require("./generate");

var _generate2 = _interopRequireDefault(_generate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function build() {
  return buildSpecInterpreter().catch(function (err) {
    return console.error("Error while building WebAssembly interpreter, validation will not be available\n" + err);
  }).then(buildCSmith).then(buildLLVM).then(prepareEmscriptenConfig)
  // Do one generation to trigger binaryen's build
  .then(function () {
    return (0, _generate2.default)()
    // It is possible to fail to generate a test file here, that doesn't mean the build failed...
    .catch(function (err) {
      return console.error(err);
    });
  });
}