import {outputDir as defaultOutdir, toolsDirectory} from "./init";
import fs from "fs-extra";
import path from "path";
import {spawn} from "child_process";
import {generateDependencies} from "./dependencies";
import {waitUntilDone} from "./utils";

export const sourceTypes = {
  c: Symbol(),
  cpp: Symbol(),
  cpp11: Symbol()
};

export default async function generate({
  sourceType = sourceTypes.c,
  validate = true,
  interpreted = true,
  srcFileName = "test",
  wasmFileName = "test",
  interpretedFileName = "interpreted",
  outdir = defaultOutdir,
  execOptions = {},
} = {}) {
  const {csmith, wasm, runEmcc} = await generateDependencies();

  await fs.ensureDirAsync(outdir);

  // Generate random c file
  let sourceFile = path.resolve(outdir, srcFileName);
  const csmithArgs = [];

  switch (sourceType) {
    case sourceTypes.c:
      sourceFile += ".c";
      break;
    case sourceTypes.cpp11:
      csmithArgs.push("--cpp11");
      // Fallthrough
    case sourceTypes.cpp:
      sourceFile += ".cpp";
      csmithArgs.push("--lang-cpp");
      break;
    default: throw new Error("Unknown source type");
  }
  const csmithProc = spawn(csmith, ["-o", sourceFile, ...csmithArgs], {
    stdio: "inherit",
    cwd: outdir,
    ...execOptions
  });
  await waitUntilDone(csmithProc);

  // Generate wasm version
  const emccCommonArgs = [
    sourceFile,
    `-I${path.join(toolsDirectory, "csmith/inc")}`,
    "-O3",
  ];
  const wasmFile = path.resolve(outdir, `${wasmFileName}.js`);
  await runEmcc([
    ...emccCommonArgs,
    "-s", "WASM=1",
    "-o", wasmFile
  ], {cwd: outdir, ...execOptions});

  // Make sure it is valid
  // Emscripten sometimes generates invalid wasm file, should investigate
  if (validate) {
    const specProc = spawn(wasm, [path.resolve(outdir, "test.wasm"), "-d"], {
      cwd: outdir,
      ...execOptions
    });
    await waitUntilDone(specProc);
  }

  // Generate interpreted version to compare result
  let interpretedFile = null;
  if (interpreted) {
    interpretedFile = path.resolve(outdir, `${interpretedFileName}.js`);
    await runEmcc([
      ...emccCommonArgs,
      "-s", "BINARYEN_METHOD='interpret-binary'",
      "-o", interpretedFile
    ], {cwd: outdir, ...execOptions});
  }

  return {
    src: sourceFile,
    wasm: wasmFile,
    interpret: interpretedFile,
  };
}
