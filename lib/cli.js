"use strict";

var doGenerate = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(maxAttempts, args) {
    var nAttempts, _ref2, wasm, src, js;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            nAttempts = 0;

          case 1:
            if (!(maxAttempts === 0 || nAttempts < maxAttempts)) {
              _context.next = 22;
              break;
            }

            nAttempts++;
            _context.prev = 3;
            _context.next = 6;
            return (0, _generate2.default)(args);

          case 6:
            _ref2 = _context.sent;
            wasm = _ref2.wasm;
            src = _ref2.src;
            js = _ref2.js;

            console.log("Source file: " + src);
            console.log("Javascript file: " + js);
            console.log("WebAssembly file: " + wasm);
            return _context.abrupt("return");

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](3);

            console.log("Failed to generate test");
            console.error(_context.t0);

          case 20:
            _context.next = 1;
            break;

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 16]]);
  }));

  return function doGenerate(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _yargs = require("yargs");

var _yargs2 = _interopRequireDefault(_yargs);

var _generate = require("./generate");

var _generate2 = _interopRequireDefault(_generate);

var _init = require("./init");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_yargs2.default.usage().help().alias("h", "help").wrap(Math.min(_yargs2.default.terminalWidth() - 1, 120)).command({
  command: "gen",
  desc: "generate a random WebAssembly test file",
  builder: function builder(yargs) {
    return yargs.options({
      attempts: {
        alias: "a",
        number: true,
        describe: "Number of attempts to generate a file, 0 for infinite",
        default: 1
      },
      outdir: {
        alias: "o",
        describe: "Output directory for the generated files",
        default: _init.outputDir
      },
      type: {
        alias: "t",
        string: true,
        describe: "Type of source file generated",
        choices: ["c", "cpp", "cpp11"],
        default: "c"
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
      "fileName": {
        string: true,
        describe: "Name of the generated files (without extension)",
        default: "test"
      },
      inline: {
        boolean: true,
        describe: "Inline the WebAssembly module in the javascript file"
      },
      silent: {
        alias: "s",
        boolean: true,
        describe: "Silently run generating tools"
      }
    });
  },
  handler: function handler(argv) {
    var args = {
      sourceType: _generate.sourceTypes[argv.type],
      validate: argv.validate,
      fileName: argv.fileName,
      outdir: argv.outdir,
      inlineWasm: argv.inline,
      execOptions: {}
    };
    if (argv.silent) {
      args.execOptions.stdio = "ignore";
    }
    doGenerate(argv.attempts, args);
  }
}).demand(1).argv;