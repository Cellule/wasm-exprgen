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
        _ref2$fileName = _ref2.fileName,
        fileName = _ref2$fileName === undefined ? "test" : _ref2$fileName,
        _ref2$outdir = _ref2.outdir,
        outdir = _ref2$outdir === undefined ? _init.outputDir : _ref2$outdir,
        _ref2$inlineWasm = _ref2.inlineWasm,
        inlineWasm = _ref2$inlineWasm === undefined ? false : _ref2$inlineWasm,
        _ref2$execOptions = _ref2.execOptions,
        execOptions = _ref2$execOptions === undefined ? {} : _ref2$execOptions;

    var _ref3, csmith, wasm, runEmcc, runEmpp, sourceFile, csmithArgs, transpiler, csmithProc, jsFile, wasmFile, wastFile, specProc, wasmBuffer, string, i, buf, oldFile, fd;

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
            sourceFile = _path2.default.resolve(outdir, fileName);
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
            jsFile = _path2.default.resolve(outdir, fileName + ".js");
            _context.next = 30;
            return transpiler([sourceFile, "-I" + _path2.default.join(_init.toolsDirectory, "csmith/inc"), "-O" + (Math.random() % 3 | 0), "-s", "WASM=1", "-s", "BINARYEN_METHOD='native-wasm" + (interpreted ? ",interpret-binary" : "") + "'", "-o", jsFile], _extends({ cwd: outdir }, execOptions));

          case 30:
            wasmFile = _path2.default.resolve(outdir, fileName + ".wasm");
            wastFile = _path2.default.resolve(outdir, fileName + ".wast");
            // Make sure it is valid
            // Emscripten sometimes generates invalid wasm file, should investigate

            if (!validate) {
              _context.next = 36;
              break;
            }

            specProc = (0, _child_process.spawn)(wasm, [wasmFile, "-d"], _extends({
              cwd: outdir
            }, execOptions));
            _context.next = 36;
            return (0, _utils.waitUntilDone)(specProc);

          case 36:
            if (!inlineWasm) {
              _context.next = 55;
              break;
            }

            _context.next = 39;
            return _fsExtra2.default.readFileAsync(wasmFile, "binary");

          case 39:
            wasmBuffer = _context.sent;
            string = "";

            for (i = 0; i < wasmBuffer.length; ++i) {
              string += "\\x" + wasmBuffer.charCodeAt(i).toString(16).padStart(2, "0");
            }
            buf = "\nvar wasmBuffer = \"" + string + "\";\nvar Module = {};\nObject.defineProperty(Module, \"readBinary\", {\n  // Prevent from overwriting this property\n  writable: false,\n  value: function(file) {\n    var buffer = new ArrayBuffer(wasmBuffer.length);\n    var view = new Uint8Array(buffer);\n    for (var i = 0; i < wasmBuffer.length; ++i) {\n      view[i] = wasmBuffer.charCodeAt(i);\n    }\n    return view;\n  }\n});\n";
            _context.next = 45;
            return _fsExtra2.default.readFileAsync(jsFile);

          case 45:
            oldFile = _context.sent;
            _context.next = 48;
            return _fsExtra2.default.openAsync(jsFile, "w");

          case 48:
            fd = _context.sent;
            _context.next = 51;
            return _fsExtra2.default.writeAsync(fd, buf, 0);

          case 51:
            _context.next = 53;
            return _fsExtra2.default.writeAsync(fd, oldFile, 0, oldFile.length);

          case 53:
            _context.next = 55;
            return _fsExtra2.default.closeAsync(fd);

          case 55:
            return _context.abrupt("return", {
              src: sourceFile,
              js: jsFile,
              wasm: wasmFile,
              wast: wastFile
            });

          case 56:
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