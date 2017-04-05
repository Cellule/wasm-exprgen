"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitUntilDone = waitUntilDone;
function waitUntilDone(proc) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      getOutput = _ref.getOutput;

  return new Promise(function (resolve, reject) {
    if (getOutput) {
      proc.stdout.on("data", function (data) {
        getOutput.stdout += data.toString();
      });
      proc.stderr.on("data", function (data) {
        getOutput.stderr += data.toString();
      });
    }
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
//# sourceMappingURL=utils.js.map