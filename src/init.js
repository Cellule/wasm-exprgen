import Promise from "bluebird";
import fs from "fs-extra";
import which from "which";
import child_process from "child_process";
import path from "path";

Promise.promisifyAll(fs);
which.async = Promise.promisify(which);
Promise.promisifyAll(child_process);

export const rootDir = path.join(__dirname, "..");
