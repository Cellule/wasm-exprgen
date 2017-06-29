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
import generate from "./generate";

async function buildCSmith() {
  const {msbuild, cmake, m4} = await csmithDependencies();
  const csmithBuildDir = buildDirectory.csmith;
  await fs.ensureDirAsync(csmithBuildDir);
  console.log("Starting CSmith build");
  const csmithPath = thirdParties.csmith;

  await execFileAsync(cmake, [
    csmithPath
  ], {
    cwd: csmithBuildDir,
    env: {
      path: `${path.dirname(msbuild)};${path.dirname(m4)};${process.env.path}`
    }
  });

  if (msbuild) {
    const vcproj = path.join(csmithBuildDir, "csmith.sln");
    await execFileAsync(msbuild, [vcproj, "/p:Configuration=Release"]);

    const output = path.join(binDirectory.csmith, "csmith.exe");
    console.log(`CSmith output: ${output}`);
  }
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
    cwd: buildDir,
    env: {
      path: `${path.dirname(msbuild)};${process.env.path}`
    }
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

export async function prepareEmscriptenConfig() {
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
    await fs.copyAsync(path.join(interpreterPath, "main", "main.d.byte"), path.join(buildDirectory.spec, "wasm.exe"));
  } else {
    const proc = spawn(make, [], {
      cwd: interpreterPath
    });
    await waitUntilDone(proc);
    await fs.copyAsync(path.join(interpreterPath, "wasm"), path.join(buildDirectory.spec, "wasm"));
  }
  console.log(`Wasm Spec output: ${binDirectory.spec}`);
}

export default function build() {
  return buildSpecInterpreter()
    .catch(err => console.error("Error while building WebAssembly interpreter, validation will not be available\n" + err))
    .then(buildCSmith)
    .then(buildLLVM)
    .then(prepareEmscriptenConfig)
    // Do one generation to trigger binaryen's build
    .then(() => generate()
      // It is possible to fail to generate a test file here, that doesn't mean the build failed...
      .catch(err => console.error(err))
    );
}
