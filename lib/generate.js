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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

    var shouldInlineWasm, _ref3, csmith, wasm, runEmcc, runEmpp, sourceFile, csmithArgs, transpiler, csmithProc, jsFile, randomOptions, wasmFile, wastFile, isValid, wasmSpecOutput, specProc, match, specErrorMessage, newJsFile, oldFile, fd, wasmBuffer, string, i, buf, nodeRegenOption;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            shouldInlineWasm = inlineWasm;
            _context.next = 3;
            return (0, _dependencies.generateDependencies)();

          case 3:
            _ref3 = _context.sent;
            csmith = _ref3.csmith;
            wasm = _ref3.wasm;
            runEmcc = _ref3.runEmcc;
            runEmpp = _ref3.runEmpp;
            _context.next = 10;
            return _fsExtra2.default.ensureDirAsync(outdir);

          case 10:

            // Generate random c file
            sourceFile = _path2.default.resolve(outdir, fileName);
            csmithArgs = [];
            transpiler = void 0;
            _context.t0 = sourceType;
            _context.next = _context.t0 === sourceTypes.c ? 16 : _context.t0 === sourceTypes.cpp11 ? 19 : _context.t0 === sourceTypes.cpp ? 20 : 24;
            break;

          case 16:
            sourceFile += ".c";
            transpiler = runEmcc;
            return _context.abrupt("break", 25);

          case 19:
            csmithArgs.push("--cpp11");

          case 20:
            sourceFile += ".cpp";
            csmithArgs.push("--lang-cpp");
            transpiler = runEmpp;
            return _context.abrupt("break", 25);

          case 24:
            throw new Error("Unknown source type");

          case 25:
            csmithProc = (0, _child_process.spawn)(csmith, ["-o", sourceFile].concat(csmithArgs), _extends({
              stdio: "inherit",
              cwd: outdir
            }, execOptions));
            _context.next = 28;
            return (0, _utils.waitUntilDone)(csmithProc);

          case 28:

            // Generate wasm version
            jsFile = _path2.default.resolve(outdir, fileName + ".js");
            randomOptions = getRandomEmscriptenOptions();
            _context.next = 32;
            return transpiler([sourceFile, "-I" + _path2.default.join(_init.toolsDirectory, "csmith/inc"), "-s", "WASM=1", "-s", "BINARYEN_METHOD='native-wasm" + (interpreted ? ",interpret-binary" : "") + "'"].concat(_toConsumableArray(randomOptions), ["-o", jsFile]), _extends({ cwd: outdir }, execOptions));

          case 32:
            wasmFile = _path2.default.resolve(outdir, fileName + ".wasm");
            wastFile = _path2.default.resolve(outdir, fileName + ".wast");

            // Make sure it is valid
            // Emscripten sometimes generates invalid wasm file, should investigate

            isValid = void 0;
            wasmSpecOutput = { stdout: "", stderr: "" };

            if (!(validate && wasm)) {
              _context.next = 55;
              break;
            }

            isValid = false;
            specProc = (0, _child_process.spawn)(wasm, [wasmFile, "-d"], {
              cwd: outdir
            });
            _context.prev = 39;
            _context.next = 42;
            return (0, _utils.waitUntilDone)(specProc, { getOutput: wasmSpecOutput });

          case 42:
            isValid = true;
            _context.next = 53;
            break;

          case 45:
            _context.prev = 45;
            _context.t1 = _context["catch"](39);

            shouldInlineWasm = true;
            match = /0x[0-9a-f]+:(.+)$/mi.exec(wasmSpecOutput.stderr);
            specErrorMessage = match && match[1] || wasmSpecOutput.stdout + wasmSpecOutput.stderr;
            newJsFile = "\n// check environment for wasm regen\nvar ENVIRONMENT_IS_NODE = typeof require !== \"undefined\";\nif (ENVIRONMENT_IS_NODE) {\n  Module[\"arguments\"] = process.argv.slice(1);\n}\n\n// {{PRE_RUN_ADDITIONS}}\nif (WebAssembly.validate(Module[\"readBinary\"]())) {\n    throw new Error(\"Fatal error: Expected binary to be invalid because: " + specErrorMessage + "\");\n}\n// {{POST_RUN_ADDITIONS}}\n";
            _context.next = 53;
            return _fsExtra2.default.writeFileAsync(jsFile, newJsFile);

          case 53:
            _context.next = 56;
            break;

          case 55:
            if (validate) {
              console.warn("WebAssembly spec interpreter is missing, unable to do validation");
            }

          case 56:
            _context.next = 58;
            return _fsExtra2.default.readFileAsync(jsFile);

          case 58:
            oldFile = _context.sent.toString();
            _context.next = 61;
            return _fsExtra2.default.openAsync(jsFile, "w");

          case 61:
            fd = _context.sent;
            _context.next = 64;
            return _fsExtra2.default.writeAsync(fd, "// Generated with options: " + randomOptions.join(" ") + "\n\n");

          case 64:
            if (!shouldInlineWasm) {
              _context.next = 76;
              break;
            }

            _context.next = 67;
            return _fsExtra2.default.readFileAsync(wasmFile, "binary");

          case 67:
            wasmBuffer = _context.sent;
            string = "";

            for (i = 0; i < wasmBuffer.length; ++i) {
              string += "\\x" + wasmBuffer.charCodeAt(i).toString(16).padStart(2, "0");
            }
            buf = "\n// {{PRE_WASM_EXPRGEN}}\nvar Module = Module || {};\nvar wasmBuffer = \"" + string + "\";\nModule[\"readBinary\"] = function(file) {\n  var buffer = new ArrayBuffer(wasmBuffer.length);\n  var view = new Uint8Array(buffer);\n  for (var i = 0; i < wasmBuffer.length; ++i) {\n    view[i] = wasmBuffer.charCodeAt(i);\n  }\n  return view;\n}\n\n\n// {{POST_WASM_EXPRGEN}}\n\n\n";
            _context.next = 73;
            return _fsExtra2.default.writeAsync(fd, buf);

          case 73:
            nodeRegenOption = "\nif (ENVIRONMENT_IS_NODE && Module[\"arguments\"].indexOf(\"--regen-wasm\") !== -1) {\n  var wasmBinaryFile = Module['wasmBinaryFile'] || \"" + _path2.default.basename(wasmFile) + "\";\n  var bin = Module[\"readBinary\"](wasmBinaryFile);\n  var wstream = require(\"fs\").createWriteStream(wasmBinaryFile, {defaultEncoding: \"binary\"});\n  wstream.write(Buffer.from(bin.buffer));\n  wstream.end();\n  wstream.on(\"finish\", function() {\n    console.log(\"WebAssembly binary buffer written to \" + wasmBinaryFile);\n  });\n} else {\n";

            oldFile = oldFile.replace("{{PRE_RUN_ADDITIONS}}", "{{PRE_RUN_ADDITIONS}}\n" + nodeRegenOption);
            oldFile = oldFile.replace("// {{POST_RUN_ADDITIONS}}", "}\n// {{POST_RUN_ADDITIONS}}");

          case 76:
            _context.next = 78;
            return _fsExtra2.default.writeAsync(fd, oldFile);

          case 78:
            _context.next = 80;
            return _fsExtra2.default.closeAsync(fd);

          case 80:
            return _context.abrupt("return", {
              src: sourceFile,
              js: jsFile,
              wasm: wasmFile,
              wast: wastFile,
              valid: isValid,
              wasmSpecOutput: wasmSpecOutput
            });

          case 81:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[39, 45]]);
  }));

  function generate() {
    return _ref.apply(this, arguments);
  }

  return generate;
}();

function getRandomEmscriptenOptions() {
  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomInt(_max) {
    var _min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var min = Math.ceil(_min);
    var max = Math.floor(_max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
  }
  // odds: chance to be true out of 10
  function roll(odds) {
    var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    return getRandomInt(max) < odds;
  }
  var optimizationLevel = getRandomInt(5);
  var options = ["-O" + (optimizationLevel < 4 ? optimizationLevel : optimizationLevel < 5 ? "s" : "z"), "-s", "RETAIN_COMPILER_SETTINGS=1"];

  var changedDefaultMem = false;
  var totalStack = 5 * 1024 * 1024;
  if (roll(3)) {
    changedDefaultMem = true;
    totalStack = getRandomInt(20, 1) * 1024 * 1024;
    options.push("-s", "TOTAL_STACK=" + totalStack);
  }

  var doMemGrowth = roll(3);
  var wasmPageSize = 65536;
  if (doMemGrowth) {
    options.push("-s", "ALLOW_MEMORY_GROWTH=1");
  }

  var changeTotalMem = roll(5);
  var totalMem = 256 * wasmPageSize;
  if (changeTotalMem) {
    changedDefaultMem = true;
    totalMem = wasmPageSize * getRandomInt(16000) | 0;
    options.push("-s", "TOTAL_MEMORY=" + totalMem);
  }

  if (changedDefaultMem && !doMemGrowth) {
    var totalMemory = wasmPageSize;
    while (totalMemory < totalMem || totalMemory < 2 * totalStack) {
      if (totalMemory < 16 * 1024 * 1024) {
        totalMemory *= 2;
      } else {
        totalMemory += 16 * 1024 * 1024;
      }
    }
    options.push("-s", "BINARYEN_MEM_MAX=" + (totalMemory >>> 0));
  }

  /* Currently not supported for WebAssembly
  if (roll(2)) {
    let splitMem = getRandomInt(totalMem, totalStack);
    splitMem = 1 << Math.log2(splitMem);
    if (splitMem < totalStack) {
      splitMem *= 2;
    }
    if (splitMem <= totalMem) {
      options.push("-s", `SPLIT_MEMORY=${splitMem}`);
    }
  }
  */

  if (roll(1, 20)) {
    options.push("-s", "GLOBAL_BASE=" + getRandomInt(1024));
  }

  if (roll(1, 20)) {
    options.push("-s", "STACK_START=" + getRandomInt(1024));
  }

  if (roll(1, 20)) {
    options.push("-s", "DOUBLE_MODE=0");
  }

  if (roll(2)) {
    options.push("-s", "PRECISE_I64_MATH=" + getRandomInt(2));
  }

  if (roll(2)) {
    options.push("-s", "AGGRESSIVE_VARIABLE_ELIMINATION=1");
  }

  if (roll(2)) {
    options.push("-s", "EMULATED_FUNCTION_POINTERS=" + getRandomInt(2, 1));
  } else if (roll(2)) {
    options.push("-s", "EMULATE_FUNCTION_POINTER_CASTS=1");
  }

  return options;
}