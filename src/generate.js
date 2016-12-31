import {outputDir, toolsDirectory} from "./init";
import fs from "fs-extra";
import path from "path";
import {spawn} from "child_process";
import {generateDependencies} from "./dependencies";
import {waitUntilDone} from "./utils";

/*
export const sourceTypes = {
  c: Symbol(),
  cpp: Symbol(),
  cpp11: Symbol()
}
*/

export default async function generate({
  //sourceType = "c"
}, execOptions = {}) {
  const {csmith, wasm, runEmcc} = await generateDependencies();

  await fs.ensureDirAsync(outputDir);
  // Generate random c file
  const csmithProc = spawn(csmith, ["-o", "test.c"], {
    stdio: "inherit",
    cwd: outputDir,
    ...execOptions
  });
  await waitUntilDone(csmithProc);

  /*
  await execFileAsync(csmithExe, ["-o", "test.cpp", "--lang-cpp"], {
    cwd: outputDir
  });
  await execFileAsync(csmithExe, ["-o", "test11.cpp", "--lang-cpp", "--cpp11"], {
    cwd: outputDir
  });
  */

  // Generate wasm version
  await runEmcc([
    "test.c",
    `-I${path.relative(outputDir, path.join(toolsDirectory, "csmith/inc"))}`,
    ..."-O3 -s WASM=1 -o test.js".split(" "),
  ], {cwd: outputDir, ...execOptions});

  // Make sure it is valid
  // Emscripten sometimes generates invalid wasm file, should investigate
  const specProc = spawn(wasm, [path.resolve(outputDir, "test.wasm"), "-d"], {
    cwd: outputDir,
    ...execOptions
  });
  await waitUntilDone(specProc);

  // Generate interpreted version to compare result
  await runEmcc([
    "test.c",
    `-I${path.relative(outputDir, path.join(toolsDirectory, "csmith/inc"))}`,
    ..."-O3 -s BINARYEN_METHOD='interpret-binary' -o interpret.js".split(" "),
  ], {cwd: outputDir, ...execOptions});

  return {
    src: path.resolve(outputDir, "test.c"),
    wasm: path.resolve(outputDir, "test.js"),
    interpret: path.resolve(outputDir, "interpret.js"),
  };
}
