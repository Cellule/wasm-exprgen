"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compileFromSource = exports.sourceTypes = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var compileFromSource = exports.compileFromSource = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(config) {
    var _ref5, wasm, runEmcc;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _dependencies.generateDependencies)();

          case 2:
            _ref5 = _context2.sent;
            wasm = _ref5.wasm;
            runEmcc = _ref5.runEmcc;
            return _context2.abrupt("return", compile(_extends({}, config, {
              transpiler: runEmcc,
              specInterpreter: wasm
            })));

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function compileFromSource(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var compile = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        sourceFile = _ref7.sourceFile,
        _ref7$validate = _ref7.validate,
        validate = _ref7$validate === undefined ? true : _ref7$validate,
        _ref7$interpreted = _ref7.interpreted,
        interpreted = _ref7$interpreted === undefined ? true : _ref7$interpreted,
        _ref7$fileName = _ref7.fileName,
        fileName = _ref7$fileName === undefined ? "test" : _ref7$fileName,
        _ref7$outdir = _ref7.outdir,
        outdir = _ref7$outdir === undefined ? _init.outputDir : _ref7$outdir,
        _ref7$inlineWasm = _ref7.inlineWasm,
        inlineWasm = _ref7$inlineWasm === undefined ? false : _ref7$inlineWasm,
        _ref7$execOptions = _ref7.execOptions,
        execOptions = _ref7$execOptions === undefined ? {} : _ref7$execOptions,
        _ref7$timeoutSpec = _ref7.timeoutSpec,
        timeoutSpec = _ref7$timeoutSpec === undefined ? _utils.defaultTimeoutSpec : _ref7$timeoutSpec,
        _ref7$timeoutTranspil = _ref7.timeoutTranspiler,
        timeoutTranspiler = _ref7$timeoutTranspil === undefined ? _utils.defaultTimeoutTranspiler : _ref7$timeoutTranspil,
        _ref7$emOptions = _ref7.emOptions,
        emOptions = _ref7$emOptions === undefined ? [] : _ref7$emOptions,
        transpiler = _ref7.transpiler,
        specInterpreter = _ref7.specInterpreter;

    var shouldInlineWasm, jsFile, clangFlags, isCpp11, wasmFile, wastFile, isValid, wasmSpecOutput, match, specErrorMessage, newJsFile, oldFile, fd, wasmBuffer, string, i, buf, nodeRegenOption;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _fsExtra2.default.ensureDirAsync(outdir);

          case 2:
            shouldInlineWasm = inlineWasm;
            // Generate wasm version

            jsFile = _path2.default.resolve(outdir, fileName + ".js");
            clangFlags = ["-w"];
            isCpp11 = sourceFile.endsWith(".cpp");

            if (isCpp11) {
              clangFlags.push("-std=c++11", "-Wno-c++11-narrowing");
            }
            _context3.next = 9;
            return transpiler([sourceFile, "-I" + _path2.default.join(_init.thirdParties.csmith, "runtime"), "-I" + _path2.default.join(_init.buildDirectory.csmith, "runtime"), "-s", "WASM=1", "-s", "BINARYEN_METHOD='native-wasm" + (interpreted ? ",interpret-binary" : "") + "'", "-s", "BINARYEN_ASYNC_COMPILATION=0", "-g"].concat(clangFlags, _toConsumableArray(emOptions), ["-o", jsFile]), _extends({ cwd: outdir }, execOptions, { timeout: timeoutTranspiler }));

          case 9:
            wasmFile = _path2.default.resolve(outdir, fileName + ".wasm");
            wastFile = _path2.default.resolve(outdir, fileName + ".wast");

            // Make sure it is valid
            // Emscripten sometimes generates invalid wasm file, should investigate

            isValid = true;
            wasmSpecOutput = null;

            if (!(validate && specInterpreter)) {
              _context3.next = 36;
              break;
            }

            _context3.prev = 14;
            _context3.next = 17;
            return (0, _execa2.default)(specInterpreter, [wasmFile, "-d"], _extends({
              cwd: outdir
            }, execOptions, {
              timeout: timeoutSpec
            }));

          case 17:
            wasmSpecOutput = _context3.sent;
            _context3.next = 34;
            break;

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](14);

            if (!(_context3.t0.timedOut || _context3.t0.killed)) {
              _context3.next = 26;
              break;
            }

            // Ignore spec interpreter result if it timed out
            console.warn("Spec interpreter timed out");
            _context3.next = 34;
            break;

          case 26:
            wasmSpecOutput = { stdout: _context3.t0.stdout, stderr: _context3.t0.stderr };
            isValid = false;
            shouldInlineWasm = true;
            match = /0x[0-9a-f]+:(.+)$/mi.exec(wasmSpecOutput.stderr);
            specErrorMessage = match && match[1] || wasmSpecOutput.stdout + wasmSpecOutput.stderr;
            newJsFile = "\n// check environment for wasm regen\nvar ENVIRONMENT_IS_NODE = typeof require !== \"undefined\";\nif (ENVIRONMENT_IS_NODE) {\n  Module[\"arguments\"] = process.argv.slice(1);\n}\n\n// {{PRE_RUN_ADDITIONS}}\nif (WebAssembly.validate(Module[\"readBinary\"]())) {\n    throw new Error(`Fatal error: Expected binary to be invalid because: " + specErrorMessage + "`);\n}\n// {{POST_RUN_ADDITIONS}}\n";
            _context3.next = 34;
            return _fsExtra2.default.writeFileAsync(jsFile, newJsFile);

          case 34:
            _context3.next = 37;
            break;

          case 36:
            if (validate) {
              console.warn("WebAssembly spec interpreter is missing, unable to do validation");
            }

          case 37:
            _context3.next = 39;
            return _fsExtra2.default.readFileAsync(jsFile);

          case 39:
            oldFile = _context3.sent.toString();
            _context3.next = 42;
            return _fsExtra2.default.openAsync(jsFile, "w");

          case 42:
            fd = _context3.sent;
            _context3.next = 45;
            return _fsExtra2.default.writeAsync(fd, "// Generated with options: " + emOptions.join(" ") + "\n\n");

          case 45:
            if (!shouldInlineWasm) {
              _context3.next = 57;
              break;
            }

            _context3.next = 48;
            return _fsExtra2.default.readFileAsync(wasmFile, "binary");

          case 48:
            wasmBuffer = _context3.sent;
            string = "";

            for (i = 0; i < wasmBuffer.length; ++i) {
              string += "\\x" + wasmBuffer.charCodeAt(i).toString(16).padStart(2, "0");
            }
            buf = "\n// {{PRE_WASM_EXPRGEN}}\nvar Module = Module || {};\nvar wasmBuffer = \"" + string + "\";\nModule[\"readBinary\"] = function(file) {\n  var buffer = new ArrayBuffer(wasmBuffer.length);\n  var view = new Uint8Array(buffer);\n  for (var i = 0; i < wasmBuffer.length; ++i) {\n    view[i] = wasmBuffer.charCodeAt(i);\n  }\n  return view;\n}\n\n\n// {{POST_WASM_EXPRGEN}}\n\n\n";
            _context3.next = 54;
            return _fsExtra2.default.writeAsync(fd, buf);

          case 54:
            nodeRegenOption = "\nif (ENVIRONMENT_IS_NODE && Module[\"arguments\"].indexOf(\"--regen-wasm\") !== -1) {\n  var wasmBinaryFile = Module['wasmBinaryFile'] || \"" + _path2.default.basename(wasmFile) + "\";\n  var bin = Module[\"readBinary\"](wasmBinaryFile);\n  var wstream = require(\"fs\").createWriteStream(wasmBinaryFile, {defaultEncoding: \"binary\"});\n  wstream.write(Buffer.from(bin.buffer));\n  wstream.end();\n  wstream.on(\"finish\", function() {\n    console.log(\"WebAssembly binary buffer written to \" + wasmBinaryFile);\n  });\n} else {\n";

            oldFile = oldFile.replace("{{PRE_RUN_ADDITIONS}}", "{{PRE_RUN_ADDITIONS}}\n" + nodeRegenOption);
            oldFile = oldFile.replace("// {{POST_RUN_ADDITIONS}}", "}\n// {{POST_RUN_ADDITIONS}}");

          case 57:
            _context3.next = 59;
            return _fsExtra2.default.writeAsync(fd, oldFile);

          case 59:
            _context3.next = 61;
            return _fsExtra2.default.closeAsync(fd);

          case 61:
            return _context3.abrupt("return", {
              src: sourceFile,
              js: jsFile,
              wasm: wasmFile,
              wast: wastFile,
              valid: isValid,
              wasmSpecOutput: wasmSpecOutput
            });

          case 62:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[14, 20]]);
  }));

  return function compile() {
    return _ref6.apply(this, arguments);
  };
}();

var _init = require("./init");

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _dependencies = require("./dependencies");

var _execa = require("execa");

var _execa2 = _interopRequireDefault(_execa);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sourceTypes = exports.sourceTypes = {
  c: Symbol(),
  cpp: Symbol(),
  cpp11: Symbol()
};

exports.default = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _ref$sourceType = _ref.sourceType,
        sourceType = _ref$sourceType === undefined ? sourceTypes.c : _ref$sourceType,
        _ref$fileName = _ref.fileName,
        fileName = _ref$fileName === undefined ? "test" : _ref$fileName,
        _ref$outdir = _ref.outdir,
        outdir = _ref$outdir === undefined ? _init.outputDir : _ref$outdir,
        _ref$execOptions = _ref.execOptions,
        execOptions = _ref$execOptions === undefined ? {} : _ref$execOptions,
        _ref$timeoutCsmith = _ref.timeoutCsmith,
        timeoutCsmith = _ref$timeoutCsmith === undefined ? _utils.defaultTimeoutCsmith : _ref$timeoutCsmith,
        args = _objectWithoutProperties(_ref, ["sourceType", "fileName", "outdir", "execOptions", "timeoutCsmith"]);

    var _ref3, csmith, wasm, runEmcc, runEmpp, sourceFile, csmithArgs, transpiler, csmithProc, randomOptions;

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
            csmithProc = (0, _execa2.default)(csmith, ["-o", sourceFile].concat(csmithArgs), _extends({
              stdio: "inherit",
              cwd: outdir
            }, execOptions, {
              timeout: timeoutCsmith
            }));
            _context.next = 27;
            return csmithProc;

          case 27:
            randomOptions = getRandomEmscriptenOptions();
            return _context.abrupt("return", compile(_extends({}, args, {
              sourceFile: sourceFile,
              fileName: fileName,
              outdir: outdir,
              execOptions: execOptions,
              emOptions: randomOptions,
              transpiler: transpiler,
              specInterpreter: wasm
            })));

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function generate() {
    return _ref2.apply(this, arguments);
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

  var totalMem = 256 * wasmPageSize;
  if (!changedDefaultMem) {
    var changeTotalMem = roll(5);
    if (changeTotalMem) {
      changedDefaultMem = true;
      totalMem = wasmPageSize * getRandomInt(16000) | 0;
    }
  }

  if (changedDefaultMem) {
    var totalMemory = wasmPageSize;
    while (totalMemory < totalMem || totalMemory < 2 * totalStack) {
      if (totalMemory < 16 * 1024 * 1024) {
        totalMemory *= 2;
      } else {
        totalMemory += 16 * 1024 * 1024;
      }
    }
    options.push("-s", "TOTAL_MEMORY=" + (totalMemory >>> 0));
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