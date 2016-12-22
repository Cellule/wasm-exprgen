"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitUntilDone = waitUntilDone;
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