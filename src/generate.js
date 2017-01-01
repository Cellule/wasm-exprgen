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
  inlineWasm = false,
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

  if (inlineWasm) {
    const wasmBuffer = await fs.readFileAsync(wasmFile, "binary");
    let string = "";
    for (let i = 0; i < wasmBuffer.length; ++i) {
      string += `\\x${wasmBuffer.charCodeAt(i).toString(16).padStart(2, "0")}`;
    }
    const buf = `
var wasmBuffer = "${string}";
var Module = {};
Object.defineProperty(Module, "readBinary", {
  // Prevent from overwriting this property
  writable: false,
  value: function(file) {
    var buffer = new ArrayBuffer(wasmBuffer.length);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < wasmBuffer.length; ++i) {
      view[i] = wasmBuffer.charCodeAt(i);
    }
    return view;
  }
});
`;
    const oldFile = await fs.readFileAsync(jsFile);
    const fd = await fs.openAsync(jsFile, "w");
    await fs.writeAsync(fd, buf, 0);
    await fs.writeAsync(fd, oldFile, 0, oldFile.length);
    await fs.closeAsync(fd);
  }

  return {
    src: sourceFile,
    js: jsFile,
    wasm: wasmFile,
  };
}
