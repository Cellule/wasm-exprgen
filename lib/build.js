"use strict";

var buildCSmith = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _this = this;

    var _ref2, msbuild, m4, csmithBinDir, csmithPath, vcproj, output, incPath, incSrcPath, m4Files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

    return regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _dependencies.csmithDependencies)();

          case 2:
            _ref2 = _context2.sent;
            msbuild = _ref2.msbuild;
            m4 = _ref2.m4;
            csmithBinDir = _path2.default.join(outputDirectory, "csmith");

            console.log("Starting CSmith build");

            csmithPath = _path2.default.join(_init.rootDir, "third_party/csmith");

            if (!msbuild) {
              _context2.next = 20;
              break;
            }

            vcproj = _path2.default.join(csmithPath, "src", "csmith.vcxproj");
            _context2.next = 12;
            return (0, _child_process.execFileAsync)(msbuild, [vcproj, "/p:Configuration=Release"]);

          case 12:
            _context2.next = 14;
            return _fsExtra2.default.ensureDirAsync(csmithBinDir);

          case 14:
            output = _path2.default.join(csmithBinDir, "csmith.exe");
            _context2.next = 17;
            return _fsExtra2.default.copyAsync(_path2.default.join(csmithPath, "src", "Release", "csmith.exe"), output, { clobber: true });

          case 17:
            console.log("CSmith output: " + output);
            _context2.next = 21;
            break;

          case 20:
            throw new Error("Build with make NYI");

          case 21:

            // Build m4 files
            incPath = _path2.default.join(csmithBinDir, "inc");
            incSrcPath = _path2.default.join(csmithPath, "runtime");
            _context2.next = 25;
            return _fsExtra2.default.emptyDirAsync(incPath);

          case 25:
            _context2.next = 27;
            return _fsExtra2.default.copyAsync(incSrcPath, incPath);

          case 27:
            _context2.next = 29;
            return _fsExtra2.default.readdirAsync(incPath);

          case 29:
            _context2.t0 = function (file) {
              return _path2.default.extname(file) === ".m4";
            };

            m4Files = _context2.sent.filter(_context2.t0);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 34;
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
                      return waitUntilDone(proc);

                    case 8:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _loop, _this);
            });
            _iterator = m4Files[Symbol.iterator]();

          case 37:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 42;
              break;
            }

            return _context2.delegateYield(_loop(), "t1", 39);

          case 39:
            _iteratorNormalCompletion = true;
            _context2.next = 37;
            break;

          case 42:
            _context2.next = 48;
            break;

          case 44:
            _context2.prev = 44;
            _context2.t2 = _context2["catch"](34);
            _didIteratorError = true;
            _iteratorError = _context2.t2;

          case 48:
            _context2.prev = 48;
            _context2.prev = 49;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 51:
            _context2.prev = 51;

            if (!_didIteratorError) {
              _context2.next = 54;
              break;
            }

            throw _iteratorError;

          case 54:
            return _context2.finish(51);

          case 55:
            return _context2.finish(48);

          case 56:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[34, 44, 48, 56], [49,, 51, 55]]);
  }));

  return function buildCSmith() {
    return _ref.apply(this, arguments);
  };
}();

var buildFastComp = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var _ref4, cmake, msbuild, make, buildDir, fastCompPath, solution, proc;

    return regeneratorRuntime.wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _dependencies.fastCompDependencies)();

          case 2:
            _ref4 = _context3.sent;
            cmake = _ref4.cmake;
            msbuild = _ref4.msbuild;
            make = _ref4.make;

            console.log("Starting LLVM build. This might take a while");

            buildDir = _path2.default.join(outputDirectory, "fastcomp");
            _context3.next = 10;
            return _fsExtra2.default.ensureDirAsync(buildDir);

          case 10:
            fastCompPath = _path2.default.join(_init.rootDir, "third_party/emscripten-fastcomp");

            console.log("Running cmake");
            _context3.next = 14;
            return (0, _child_process.execFileAsync)(cmake, [fastCompPath, "-DCMAKE_BUILD_TYPE=Release", "-DLLVM_TARGETS_TO_BUILD=X86;JSBackend", "-DLLVM_INCLUDE_EXAMPLES=OFF", "-DLLVM_INCLUDE_TESTS=OFF", "-DCLANG_INCLUDE_EXAMPLES=OFF", "-DCLANG_INCLUDE_TESTS=OFF"], {
              cwd: buildDir
            });

          case 14:
            if (!msbuild) {
              _context3.next = 23;
              break;
            }

            console.log("Running msbuild");
            solution = _path2.default.join(buildDir, "LLVM.sln");
            proc = (0, _child_process.spawn)(msbuild, [solution, "/p:Configuration=Release"], {
              stdio: "inherit"
            });
            _context3.next = 20;
            return waitUntilDone(proc);

          case 20:
            console.log("LLVM output: " + _path2.default.join(buildDir, "Release/bin"));
            _context3.next = 27;
            break;

          case 23:
            console.log("Running make");
            _context3.next = 26;
            return (0, _child_process.execFileAsync)(make, ["-j4"], { cwd: buildDir });

          case 26:
            console.log("LLVM output: " + _path2.default.join(buildDir, "bin"));

          case 27:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee2, this);
  }));

  return function buildFastComp() {
    return _ref3.apply(this, arguments);
  };
}();

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _git = require("./git");

var _init = require("./init");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _dependencies = require("./dependencies");

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var outputDirectory = _path2.default.join(_init.rootDir, "tools");

function waitUntilDone(proc) {
  return new Promise(function (resolve, reject) {
    proc.on("exit", function (code) {
      if (code !== 0) {
        return reject(new Error("Command terminated with exit code " + code + "\n" + proc.spawnargs.join(" ")));
      }
      resolve();
    });
    proc.on("error", function (err) {
      return reject(err);
    });
  });
}

(0, _git.checkSubmodules)().then(buildCSmith).then(buildFastComp).catch(function (err) {
  return console.error(err);
});