import {checkSubmodules} from "./git";
import {rootDir, buildDirectory, binDirectory} from "./init";
import path from "path";
import fs from "fs-extra";
import {csmithDependencies, llvmDependencies} from "./dependencies";
import {execFileAsync, spawn} from "child_process";
import {waitUntilDone} from "./utils";

async function buildCSmith() {
  const {msbuild, m4} = await csmithDependencies();
  const csmithBinDir = buildDirectory.csmith;
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

async function buildLLVM() {
  const {
    cmake,
    msbuild,
    make
  } = await llvmDependencies();
  console.log("Starting LLVM build. This might take a while");

  const buildDir = buildDirectory.llvm;
  await fs.ensureDirAsync(buildDir);

  const llvmPath = path.join(rootDir, "third_party/emscripten-fastcomp");
  console.log("Running cmake");
  await execFileAsync(cmake, [
    llvmPath,
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
  } else {
    console.log("Running make");
    await execFileAsync(make, ["-j4"], {cwd: buildDir});
  }
  console.log(`LLVM output: ${binDirectory.llvm}`);
}

checkSubmodules()
  .then(() => Promise.all([buildCSmith(), buildLLVM()]))
  .catch(err => console.error(err));
