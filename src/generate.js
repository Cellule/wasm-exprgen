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
  const randomOptions = getRandomEmscriptenOptions();
  await transpiler([
    sourceFile,
    `-I${path.join(toolsDirectory, "csmith/inc")}`,
    "-s", "WASM=1",
    "-s", `BINARYEN_METHOD='native-wasm${interpreted ? ",interpret-binary" : ""}'`,
    ...randomOptions,
    "-o", jsFile
  ], {cwd: outdir, ...execOptions});

  const wasmFile = path.resolve(outdir, `${fileName}.wasm`);
  const wastFile = path.resolve(outdir, `${fileName}.wast`);
  // Make sure it is valid
  // Emscripten sometimes generates invalid wasm file, should investigate
  let isValid;
  if (validate) {
    isValid = false;
    const specProc = spawn(wasm, [wasmFile, "-d"], {
      cwd: outdir,
      ...execOptions
    });
    try {
      await waitUntilDone(specProc);
      isValid = true;
    } catch (e) {
      // ignore
    }
  }

  const oldFile = await fs.readFileAsync(jsFile);
  const fd = await fs.openAsync(jsFile, "w");
  await fs.writeAsync(fd, `// Generated with options: ${randomOptions.join(" ")}\n\n`);
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
});\n\n
`;
    await fs.writeAsync(fd, buf);
  }
  await fs.writeAsync(fd, oldFile);
  await fs.closeAsync(fd);

  return {
    src: sourceFile,
    js: jsFile,
    wasm: wasmFile,
    wast: wastFile,
    valid: isValid,
  };
}

function getRandomEmscriptenOptions() {
  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomInt(max, min = 0) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
  }
  // odds: chance to be true out of 10
  function roll(odds, max = 10) {
    return getRandomInt(max) < odds;
  }
  const optimizationLevel = getRandomInt(5);
  const options = [
    `-O${optimizationLevel < 4 ? optimizationLevel : optimizationLevel < 5 ? "s" : "z"}`,
    "-s", "RETAIN_COMPILER_SETTINGS=1"
  ];

  let changedDefaultMem = false;
  let totalStack = 5 * 1024 * 1024;
  if (roll(3)) {
    changedDefaultMem = true;
    totalStack = getRandomInt(20) * 1024 * 1024;
    options.push("-s", `TOTAL_STACK=${totalStack}`);
  }

  const doMemGrowth = roll(3);
  const wasmPageSize = 65536;
  if (doMemGrowth) {
    options.push("-s", "ALLOW_MEMORY_GROWTH=1");
  }

  const changeTotalMem = roll(5);
  let totalMem = 256 * wasmPageSize;
  if (changeTotalMem) {
    changedDefaultMem = true;
    totalMem = (wasmPageSize * getRandomInt(32768)) | 0;
    options.push("-s", `TOTAL_MEMORY=${totalMem}`);
  }

  if (changedDefaultMem && !doMemGrowth) {
    options.push("-s", `BINARYEN_MEM_MAX=${Math.max(totalMem*2, totalStack*2)|0}`);
  }

  /* Currently not supported for WebAssembly
  if (roll(2)) {
    let splitMem = getRandomInt(totalMem, totalStack);
    splitMem = 1 << Math.log2(splitMem);
    if (splitMem < totalStack) {
      splitMem *= 2;
    }
    if (splitMem <= totalMem) {
      options.push("-s", `SPLIT_MEMORY=${splitMem}`);
    }
  }
  */

  if (roll(1, 20)) {
    options.push("-s", `GLOBAL_BASE=${getRandomInt(1024)}`);
  }

  if (roll(1, 20)) {
    options.push("-s", `STACK_START=${getRandomInt(1024)}`);
  }

  if (roll(1, 20)) {
    options.push("-s", "DOUBLE_MODE=0");
  }

  if (roll(2)) {
    options.push("-s", `PRECISE_I64_MATH=${getRandomInt(2)}`);
  }

  if (roll(2)) {
    options.push("-s", "AGGRESSIVE_VARIABLE_ELIMINATION=1");
  }

  if (roll(2)) {
    options.push("-s", `EMULATED_FUNCTION_POINTERS=${getRandomInt(2, 1)}`);
  } else if (roll(2)) {
    options.push("-s", "EMULATE_FUNCTION_POINTER_CASTS=1");
  }

  return options;
}
