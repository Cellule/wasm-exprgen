import os from "os";
import {checkSubmodules} from "./git";
import {rootDir} from "./init";
import path from "path";
import fs from "fs-extra";
import {csmithDependencies, fastCompDependencies} from "./dependencies";
import {execFileAsync, spawn} from "child_process";
const outputDirectory = path.join(rootDir, "tools");

function waitUntilDone(proc) {
  return new Promise((resolve, reject) => {
    proc.on("exit", code => {
      if (code !== 0) {
        return reject(new Error(`Command terminated with exit code ${code}\n${proc.spawnargs.join(" ")}`));
      }
      resolve();
    });
    proc.on("error", err => reject(err));
  });
}

async function buildCSmith() {
  const {msbuild, m4} = await csmithDependencies();
  const csmithBinDir = path.join(outputDirectory, "csmith");
  console.log("Starting CSmith build");

  const csmithPath = path.join(rootDir, "third_party/csmith");
  if (msbuild) {
    const vcproj = path.join(csmithPath, "src", "csmith.vcxproj");
    await execFileAsync(msbuild, [vcproj, "/p:Configuration=Release"]);

    await fs.ensureDirAsync(csmithBinDir);
    const output = path.join(csmithBinDir, "csmith.exe");
    await fs.copyAsync(
      path.join(csmithPath, "src", "Release", "csmith.exe"),
      output,
      {clobber: true}
    );
    console.log(`CSmith output: ${output}`);
  } else {
    throw new Error("Build with make NYI");
  }

  // Build m4 files
  const incPath = path.join(csmithBinDir, "inc");
  const incSrcPath = path.join(csmithPath, "runtime");
  await fs.emptyDirAsync(incPath);
  await fs.copyAsync(incSrcPath, incPath);
  const m4Files = (await fs.readdirAsync(incPath)).filter(file => path.extname(file) === ".m4");
  for (const m4File of m4Files) {
    const filename = path.basename(m4File, ".m4");
    const stream = fs.createWriteStream(path.join(incPath, `${filename}.h`));
    await (new Promise(r => stream.on("open", r)));
    const proc = spawn(m4, [path.join(incPath, m4File)], {
      stdio: [stream, stream, stream]
    });
    await waitUntilDone(proc);
  }
}

async function buildFastComp() {
  const {
    cmake,
    msbuild,
    make
  } = await fastCompDependencies();
  console.log("Starting LLVM build. This might take a while");

  const buildDir = path.join(outputDirectory, "fastcomp");
  await fs.ensureDirAsync(buildDir);

  const fastCompPath = path.join(rootDir, "third_party/emscripten-fastcomp");
  console.log("Running cmake");
  await execFileAsync(cmake, [
    fastCompPath,
    "-DCMAKE_BUILD_TYPE=Release",
    "-DLLVM_TARGETS_TO_BUILD=X86;JSBackend",
    "-DLLVM_INCLUDE_EXAMPLES=OFF",
    "-DLLVM_INCLUDE_TESTS=OFF",
    "-DCLANG_INCLUDE_EXAMPLES=OFF",
    "-DCLANG_INCLUDE_TESTS=OFF",
  ], {
    cwd: buildDir
  });

  if (msbuild) {
    console.log("Running msbuild");
    const solution = path.join(buildDir, "LLVM.sln");
    const proc = spawn(msbuild, [solution, "/p:Configuration=Release"], {
      stdio: "inherit"
    });
    await waitUntilDone(proc);
    console.log(`LLVM output: ${path.join(buildDir, "Release/bin")}`);
  } else {
    console.log("Running make");
    await execFileAsync(make, ["-j4"], {cwd: buildDir});
    console.log(`LLVM output: ${path.join(buildDir, "bin")}`);
  }
}

checkSubmodules()
  .then(buildCSmith)
  .then(buildFastComp)
  .catch(err => console.error(err));
