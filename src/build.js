import {buildDirectory, binDirectory, outputDir, thirdParties} from "./init";
import path from "path";
import fs from "fs-extra";
import {
  csmithDependencies,
  llvmDependencies,
  emscriptenDependencies,
  specInterpreterDependencies
} from "./dependencies";
import {execFileAsync, spawn} from "child_process";
import {waitUntilDone} from "./utils";

async function buildCSmith() {
  const {msbuild, make, m4} = await csmithDependencies();
  const csmithBinDir = buildDirectory.csmith;
  await fs.ensureDirAsync(csmithBinDir);
  console.log("Starting CSmith build");

  const csmithPath = thirdParties.csmith;
  const incPath = path.join(csmithBinDir, "inc");
  let output;
  let binSrc;
  if (msbuild) {
    const vcproj = path.join(csmithPath, "src", "csmith.vcxproj");
    await execFileAsync(msbuild, [vcproj, "/p:Configuration=Release"]);

    output = path.join(csmithBinDir, "csmith.exe");
    binSrc = path.join(csmithPath, "src", "Release", "csmith.exe");
    console.log(`CSmith output: ${output}`);
  } else {
    const procConf = spawn(path.join(csmithPath, "configure"), [], {
      cwd: csmithPath,
      stdio: "inherit"
    });
    await waitUntilDone(procConf);
    const procMake = spawn(make, [], {
      cwd: csmithPath,
      stdio: "inherit"
    });
    await waitUntilDone(procMake);
    output = path.join(csmithBinDir, "csmith");
    binSrc = path.join(csmithPath, "src", "csmith");
  }
  const incSrcPath = path.join(csmithPath, "runtime");
  await fs.emptyDirAsync(incPath);
  await fs.copyAsync(incSrcPath, incPath);
  await fs.copyAsync(
    binSrc,
    output,
    {clobber: true}
  );

  if (msbuild) {
    // Build m4 files
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
  console.log(`CSmith output: ${output}`);
}

async function buildLLVM() {
  const clangPath = thirdParties.clang;
  const clangDestPath = path.join(thirdParties.llvm, "tools/clang");
  console.log(`Copying ${clangPath} => ${clangDestPath}`);
  await fs.copyAsync(clangPath, clangDestPath);

  const {
    cmake,
    msbuild,
    make
  } = await llvmDependencies();
  console.log("Starting LLVM build. This might take a while...");

  const buildDir = buildDirectory.llvm;
  await fs.ensureDirAsync(buildDir);

  const llvmPath = thirdParties.llvm;
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
    const proc = spawn(make, ["-j4"], {
      cwd: buildDir,
      stdio: "inherit"
    });
    await waitUntilDone(proc);
  }
  console.log(`LLVM output: ${binDirectory.llvm}`);
}

async function prepareEmscriptenConfig() {
  const {python} = await emscriptenDependencies();
  const cleanPath = p => p.replace(/\\/g, "/");
  const tmpDir = path.join(outputDir, "tmp");
  const file = `
EMSCRIPTEN_ROOT = '${cleanPath(thirdParties.emscripten)}'
LLVM_ROOT= '${cleanPath(binDirectory.llvm)}'
PYTHON = '${cleanPath(python)}'
NODE_JS= '${cleanPath(process.argv[0])}'
TEMP_DIR = '${cleanPath(tmpDir)}'
COMPILER_ENGINE = NODE_JS
JS_ENGINES = [NODE_JS]
`;
  await fs.ensureDirAsync(tmpDir);
  const emscriptenFile = path.join(outputDir, ".emscripten");
  await fs.outputFileAsync(emscriptenFile, file);
  console.log(`Generated config file ${emscriptenFile}`);
}

async function buildSpecInterpreter() {
  console.log("Starting Spec interpreter build");
  await fs.ensureDirAsync(buildDirectory.spec);
  const interpreterPath = path.join(thirdParties.spec, "interpreter");
  const {cmd, make} = await specInterpreterDependencies();
  if (cmd) {
    const proc = spawn(cmd, ["/c", "winmake"], {
      cwd: interpreterPath
    });
    await waitUntilDone(proc);
    await fs.copyAsync(path.join(interpreterPath, "wasm.exe"), path.join(buildDirectory.spec, "wasm.exe"));
  } else {
    const proc = spawn(make, [], {
      cwd: interpreterPath
    });
    await waitUntilDone(proc);
    await fs.copyAsync(path.join(interpreterPath, "wasm"), path.join(buildDirectory.spec, "wasm"));
  }
  console.log(`Wasm Spec output: ${binDirectory.spec}`);
}

buildSpecInterpreter()
  .then(buildCSmith)
  .then(buildLLVM)
  .then(prepareEmscriptenConfig)
  .catch(err => console.error(err));
