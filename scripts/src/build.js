import {checkSubmodules} from "./git";
import {rootDir} from "./init";
import path from "path";
import fs from "fs-extra";
import {checkCSmithDependencies} from "./dependencies";
import {spawn} from "child_process";

const binDirectory = path.join(rootDir, "run", "bin");

function output(data, write = process.stdout.write) {
  write(data.toString());
};

function run(cmd, args = [], {
  env,
  cwd,
  fireAndForget,
  stdio = [1, 2, 3]
} = {}) {
  return new Promise((resolve, reject) => {
    const over = err => {
      if (err) {
        output(err, process.stderr.write);
        output(os.EOL);
        return reject(err);
      } else {
        output(os.EOL);
      }
      resolve();
    };

    const pcmd = spawn(cmd, args, {env, cwd, detached: fireAndForget, stdio});
    if (fireAndForget) {
      debug("Not waiting for command to end");
      pcmd.unref();
      over();
    } else {
      pcmd.on("error", over);
      pcmd.on("exit", code => {
        const err = code
        ? new Error(`Command ${cmd}. Exit with code ${code}\n`)
        : null;
        over(err);
      });
      if (pcmd.stdout && pcmd.stderr) {
        pcmd.stdout.on("data", data => {
          output(data);
        });
        pcmd.stderr.on("data", data => output(data, process.stderr.write));
      }
    }
  });
}

async function buildCSmith() {
  const {msbuild} = await checkCSmithDependencies();
  const csmithBinDir = path.join(binDirectory, "csmith");
  if (msbuild) {
    const csmithPath = path.join(rootDir, "third_party/csmith");
    const vcproj = path.join(csmithPath, "src", "csmith.vcxproj");
    await run(msbuild, [vcproj, "/p:Configuration=Release"]);

    await fs.ensureDirAsync(csmithBinDir);
    await fs.copyAsync(
      path.join(csmithPath, "src", "Release", "csmith.exe"),
      path.join(csmithBinDir, "csmith.exe"),
      {clobber: true}
    )
  } else {
    throw new Error("Build with make NYI");
  }
}

checkSubmodules()
  .then(buildCSmith)
  .catch(err => console.error(err));
