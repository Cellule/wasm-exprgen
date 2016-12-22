import Promise from "bluebird";
import fs from "fs-extra";
import which from "which";
import childProcess from "child_process";
import path from "path";
import os from "os";

export const isWindows = os.platform() === "win32";

Promise.promisifyAll(fs);
which.async = Promise.promisify(which);
Promise.promisifyAll(childProcess);

export const rootDir = path.join(__dirname, "..");
export const toolsDirectory = path.join(rootDir, "tools");
export const buildDirectory = {
  csmith: path.join(toolsDirectory, "csmith"),
  llvm: path.join(toolsDirectory, "llvm")
};
export const binDirectory = {
  csmith: buildDirectory.csmith,
  llvm: path.join(buildDirectory.llvm, isWindows ? "Release/bin" : "bin")
};
export const outputDir = path.join(rootDir, "output");
