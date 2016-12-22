"use strict";

var main = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var backup, _ref2, python, runEmcc, variables, content, lines, i, key, _key;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _git.checkSubmodules)();

          case 2:
            _context.prev = 2;

            _fsExtra2.default.statSync(emscriptenFile);
            backup = _path2.default.join(_path2.default.dirname(emscriptenFile), ".emscripten.backup");

            console.log(emscriptenFile + " is already present, making a backup for you at " + backup + ".");
            _context.next = 8;
            return _fsExtra2.default.moveAsync(emscriptenFile, backup, { clobber: true });

          case 8:
            _context.next = 14;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](2);

            if (!(_context.t0.code !== "ENOENT")) {
              _context.next = 14;
              break;
            }

            throw _context.t0;

          case 14:
            _context.next = 16;
            return (0, _dependencies.emscriptenDependencies)();

          case 16:
            _ref2 = _context.sent;
            python = _ref2.python;
            runEmcc = _ref2.runEmcc;
            _context.next = 21;
            return runEmcc();

          case 21:

            // Update .emscripten file
            variables = {
              PYTHON: "'" + python + "'",
              LLVM_ROOT: "'" + _init.binDirectory.llvm + "'",
              NODE_JS: "'" + process.argv[0] + "'"
            };

            Object.keys(variables).forEach(function (key) {
              variables[key] = key + "= " + variables[key].replace(/\\/g, "/");
            });

            console.log("Editing file " + emscriptenFile + "\nUpdated paths:\n  " + Object.keys(variables).map(function (key) {
              return variables[key];
            }).join("\n  ") + "\n");
            _context.next = 26;
            return _fsExtra2.default.readFileAsync(emscriptenFile);

          case 26:
            content = _context.sent.toString();
            lines = content.split("\n");
            i = 0;

          case 29:
            if (!(i < lines.length)) {
              _context.next = 42;
              break;
            }

            _context.t1 = regeneratorRuntime.keys(variables);

          case 31:
            if ((_context.t2 = _context.t1()).done) {
              _context.next = 39;
              break;
            }

            key = _context.t2.value;

            if (!lines[i].startsWith(key)) {
              _context.next = 37;
              break;
            }

            lines[i] = variables[key];
            Reflect.deleteProperty(variables, key);
            return _context.abrupt("break", 39);

          case 37:
            _context.next = 31;
            break;

          case 39:
            ++i;
            _context.next = 29;
            break;

          case 42:
            // add keys that were missing at the end of the file
            for (_key in variables) {
              lines.push(variables[_key]);
            }
            _context.next = 45;
            return _fsExtra2.default.writeFileAsync(emscriptenFile, lines.join("\n"));

          case 45:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 10]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _init = require("./init");

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _git = require("./git");

var _dependencies = require("./dependencies");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var emscriptenFile = _path2.default.resolve(_init.isWindows ? process.env.userprofile : "~/", ".emscripten");


main().catch(function (err) {
  return console.error(err);
});