"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sourceTypes = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _init = require("./init");

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _child_process = require("child_process");

var _dependencies = require("./dependencies");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sourceTypes = exports.sourceTypes = {
  c: Symbol(),
  cpp: Symbol(),
  cpp11: Symbol()
};

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$sourceType = _ref2.sourceType,
        sourceType = _ref2$sourceType === undefined ? sourceTypes.c : _ref2$sourceType,
        _ref2$validate = _ref2.validate,
        validate = _ref2$validate === undefined ? true : _ref2$validate,
        _ref2$interpreted = _ref2.interpreted,
        interpreted = _ref2$interpreted === undefined ? true : _ref2$interpreted,
        _ref2$srcFileName = _ref2.srcFileName,
        srcFileName = _ref2$srcFileName === undefined ? "test" : _ref2$srcFileName,
        _ref2$wasmFileName = _ref2.wasmFileName,
        wasmFileName = _ref2$wasmFileName === undefined ? "test" : _ref2$wasmFileName,
        _ref2$interpretedFile = _ref2.interpretedFileName,
        interpretedFileName = _ref2$interpretedFile === undefined ? "interpreted" : _ref2$interpretedFile,
        _ref2$outdir = _ref2.outdir,
        outdir = _ref2$outdir === undefined ? _init.outputDir : _ref2$outdir,
        _ref2$execOptions = _ref2.execOptions,
        execOptions = _ref2$execOptions === undefined ? {} : _ref2$execOptions;

    var _ref3, csmith, wasm, runEmcc, runEmpp, sourceFile, csmithArgs, transpiler, csmithProc, emccCommonArgs, wasmFile, specProc, interpretedFile;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _dependencies.generateDependencies)();

          case 2:
            _ref3 = _context.sent;
            csmith = _ref3.csmith;
            wasm = _ref3.wasm;
            runEmcc = _ref3.runEmcc;
            runEmpp = _ref3.runEmpp;
            _context.next = 9;
            return _fsExtra2.default.ensureDirAsync(outdir);

          case 9:

            // Generate random c file
            sourceFile = _path2.default.resolve(outdir, srcFileName);
            csmithArgs = [];
            transpiler = void 0;
            _context.t0 = sourceType;
            _context.next = _context.t0 === sourceTypes.c ? 15 : _context.t0 === sourceTypes.cpp11 ? 18 : _context.t0 === sourceTypes.cpp ? 19 : 23;
            break;

          case 15:
            sourceFile += ".c";
            transpiler = runEmcc;
            return _context.abrupt("break", 24);

          case 18:
            csmithArgs.push("--cpp11");

          case 19:
            sourceFile += ".cpp";
            csmithArgs.push("--lang-cpp");
            transpiler = runEmpp;
            return _context.abrupt("break", 24);

          case 23:
            throw new Error("Unknown source type");

          case 24:
            csmithProc = (0, _child_process.spawn)(csmith, ["-o", sourceFile].concat(csmithArgs), _extends({
              stdio: "inherit",
              cwd: outdir
            }, execOptions));
            _context.next = 27;
            return (0, _utils.waitUntilDone)(csmithProc);

          case 27:

            // Generate wasm version
            emccCommonArgs = [sourceFile, "-I" + _path2.default.join(_init.toolsDirectory, "csmith/inc"), "-O3"];
            wasmFile = _path2.default.resolve(outdir, wasmFileName + ".js");
            _context.next = 31;
            return transpiler([].concat(emccCommonArgs, ["-s", "WASM=1", "-o", wasmFile]), _extends({ cwd: outdir }, execOptions));

          case 31:
            if (!validate) {
              _context.next = 35;
              break;
            }

            specProc = (0, _child_process.spawn)(wasm, [_path2.default.resolve(outdir, "test.wasm"), "-d"], _extends({
              cwd: outdir
            }, execOptions));
            _context.next = 35;
            return (0, _utils.waitUntilDone)(specProc);

          case 35:

            // Generate interpreted version to compare result
            interpretedFile = null;

            if (!interpreted) {
              _context.next = 40;
              break;
            }

            interpretedFile = _path2.default.resolve(outdir, interpretedFileName + ".js");
            _context.next = 40;
            return transpiler([].concat(emccCommonArgs, ["-s", "BINARYEN_METHOD='interpret-binary'", "-o", interpretedFile]), _extends({ cwd: outdir }, execOptions));

          case 40:
            return _context.abrupt("return", {
              src: sourceFile,
              wasm: wasmFile,
              interpret: interpretedFile
            });

          case 41:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function generate() {
    return _ref.apply(this, arguments);
  }

  return generate;
}();