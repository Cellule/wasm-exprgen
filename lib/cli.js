"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var doGenerate = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(genFn, maxAttempts, args) {
    var nAttempts, _ref2, wasm, src, js, valid;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            nAttempts = 0;

          case 1:
            if (!(maxAttempts === 0 || nAttempts < maxAttempts)) {
              _context.next = 23;
              break;
            }

            nAttempts++;
            _context.prev = 3;
            _context.next = 6;
            return genFn(args);

          case 6:
            _ref2 = _context.sent;
            wasm = _ref2.wasm;
            src = _ref2.src;
            js = _ref2.js;
            valid = _ref2.valid;

            console.log("Source file: " + src);
            console.log("Javascript file: " + js);
            console.log("WebAssembly file: " + wasm + (args.validate ? " is " + (valid ? "" : "not ") + "valid" : ""));
            return _context.abrupt("return");

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](3);

            console.log("Failed to generate test");
            console.error(_context.t0);

          case 21:
            _context.next = 1;
            break;

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 17]]);
  }));

  return function doGenerate(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _yargs2 = require("yargs");

var _yargs3 = _interopRequireDefault(_yargs2);

var _generate = require("./generate");

var _generate2 = _interopRequireDefault(_generate);

var _init = require("./init");

var _build = require("./build");

var _build2 = _interopRequireDefault(_build);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var commonGenOptions = {
  outdir: {
    alias: "o",
    describe: "Output directory for the generated files",
    default: _init.outputDir
  },
  validate: {
    boolean: true,
    describe: "Run wasm-spec interpreter to validate generated file",
    default: true
  },
  interpreted: {
    boolean: true,
    describe: "Generate interpreted version for comparison purposes",
    default: true
  },
  inline: {
    boolean: true,
    describe: "Inline the WebAssembly module in the javascript file"
  },
  silent: {
    alias: "s",
    boolean: true,
    describe: "Silently run generating tools"
  },
  "timeout-em": {
    number: true,
    describe: "Timeout for emscripten",
    default: _utils.defaultTimeoutTranspiler
  },
  "timeout-spec": {
    number: true,
    describe: "Timeout for spec interpreter",
    default: _utils.defaultTimeoutSpec
  }
};

_yargs3.default.usage().help().alias("h", "help").wrap(Math.min(_yargs3.default.terminalWidth() - 1, 120)).command({
  command: "config",
  desc: "Updates Emscripten configuration file for this machine",
  handler: function handler() {
    (0, _build.prepareEmscriptenConfig)().then(function () {
      return console.log("Configuration completed");
    }).catch(function (err) {
      console.error(err);
      process.exit(1);
    });
  }
}).command({
  command: "build",
  desc: "Build the tools needed",
  handler: function handler() {
    (0, _build2.default)().then(function () {
      return console.log("Build completed");
    }).catch(function (err) {
      console.error(err);
      process.exit(1);
    });
  }
}).command({
  command: "gen",
  desc: "generate a random WebAssembly test file",
  builder: function builder(_yargs) {
    return _yargs.options(_extends({}, commonGenOptions, {
      "timeout-csmith": {
        number: true,
        describe: "Timeout for csmith",
        default: _utils.defaultTimeoutCsmith
      },
      attempts: {
        alias: "a",
        number: true,
        describe: "Number of attempts to generate a file, 0 for infinite",
        default: 1
      },
      type: {
        alias: "t",
        string: true,
        describe: "Type of source file generated",
        choices: ["c", "cpp", "cpp11"],
        default: "c"
      },
      fileName: {
        string: true,
        describe: "Name of the generated files (without extension)",
        default: "test"
      }
    }));
  },
  handler: function handler(argv) {
    var args = {
      sourceType: _generate.sourceTypes[argv.type],
      validate: argv.validate,
      fileName: argv.fileName,
      outdir: argv.outdir,
      inlineWasm: argv.inline,
      timeoutSpec: argv.timeoutSpec,
      timeoutCsmith: argv.timeoutCsmith,
      timeoutTranspiler: argv.timeoutEm,
      execOptions: {}
    };
    if (argv.silent) {
      args.execOptions.stdio = "ignore";
    }
    doGenerate(_generate2.default, argv.attempts, args);
  }
}).command({
  command: "regen",
  desc: "generate WebAssembly from a .c source file",
  builder: function builder(_yargs) {
    return _yargs.options(_extends({}, commonGenOptions, {
      source: {
        required: true,
        string: true,
        describe: "Source file to regenerate"
      },
      emargs: {
        string: true,
        describe: "Space separated extra arguments to pass to emcc"
      }
    }));
  },
  handler: function handler(argv) {
    var args = {
      validate: argv.validate,
      sourceFile: argv.source,
      outdir: argv.outdir,
      inlineWasm: argv.inline,
      timeoutSpec: argv.timeoutSpec,
      timeoutTranspiler: argv.timeoutEm,
      execOptions: {},
      emOptions: (argv.emargs || "").split(" ")
    };
    if (argv.silent) {
      args.execOptions.stdio = "ignore";
    }
    doGenerate(_generate.compileFromSource, 1, args);
  }
}).demand(1).argv;