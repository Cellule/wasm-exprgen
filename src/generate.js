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
  fileName = "test",
  outdir = defaultOutdir,
  execOptions = {},
} = {}) {
  const {csmith, wasm, runEmcc, runEmpp} = await generateDependencies();

  await fs.ensureDirAsync(outdir);

  // Generate random c file
  let sourceFile = path.resolve(outdir, fileName);
  const csmithArgs = [];
  let transpiler;
  switch (sourceType) {
    case sourceTypes.c:
      sourceFile += ".c";
      transpiler = runEmcc;
      break;
    case sourceTypes.cpp11:
      csmithArgs.push("--cpp11");
      // Fallthrough
    case sourceTypes.cpp:
      sourceFile += ".cpp";
      csmithArgs.push("--lang-cpp");
      transpiler = runEmpp;
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
  const jsFile = path.resolve(outdir, `${fileName}.js`);
  await transpiler([
    sourceFile,
    `-I${path.join(toolsDirectory, "csmith/inc")}`,
    "-O3",
    "-s", "WASM=1",
    "-s", `BINARYEN_METHOD='native-wasm${interpreted ? ",interpret-binary" : ""}'`,
    "-o", jsFile
  ], {cwd: outdir, ...execOptions});

  const wasmFile = path.resolve(outdir, `${fileName}.wasm`);
  // Make sure it is valid
  // Emscripten sometimes generates invalid wasm file, should investigate
  if (validate) {
    const specProc = spawn(wasm, [wasmFile, "-d"], {
      cwd: outdir,
      ...execOptions
    });
    await waitUntilDone(specProc);
  }

  return {
    src: sourceFile,
    js: jsFile,
    wasm: wasmFile,
  };
}
