"use strict";

var main = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _ref2, csmith, _ref3, runEmcc;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _dependencies.generateDependencies)();

          case 2:
            _ref2 = _context.sent;
            csmith = _ref2.csmith;
            _context.next = 6;
            return (0, _dependencies.emscriptenDependencies)();

          case 6:
            _ref3 = _context.sent;
            runEmcc = _ref3.runEmcc;
            _context.next = 10;
            return _fsExtra2.default.ensureDirAsync(_init.outputDir);

          case 10:
            _context.next = 12;
            return (0, _child_process.execFileAsync)(csmith, ["-o", "test.c"], {
              cwd: _init.outputDir
            });

          case 12:
            _context.next = 14;
            return runEmcc(["test.c", "-I" + _path2.default.relative(_init.outputDir, _path2.default.join(_init.toolsDirectory, "csmith/inc"))].concat(_toConsumableArray("-O3 -s WASM=1 -o test.js".split(" "))), { cwd: _init.outputDir });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _init = require("./init");

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _child_process = require("child_process");

var _dependencies = require("./dependencies");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

main().catch(console.error);