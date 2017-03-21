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
  execOptions = {}
} = {}) {
  let shouldInlineWasm = inlineWasm;
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
    "-s", "BINARYEN_ASYNC_COMPILATION=0",
    "-g",
    ...randomOptions,
    "-o", jsFile
  ], {cwd: outdir, ...execOptions});
  const wasmFile = path.resolve(outdir, `${fileName}.wasm`);
  const wastFile = path.resolve(outdir, `${fileName}.wast`);

  // Make sure it is valid
  // Emscripten sometimes generates invalid wasm file, should investigate
  let isValid;
  const wasmSpecOutput = {stdout: "", stderr: ""};
  if (validate && wasm) {
    isValid = false;
    const specProc = spawn(wasm, [wasmFile, "-d"], {
      cwd: outdir
    });
    try {
      await waitUntilDone(specProc, {getOutput: wasmSpecOutput});
      isValid = true;
    } catch (e) {
      shouldInlineWasm = true;
      const match = /0x[0-9a-f]+:(.+)$/mi.exec(wasmSpecOutput.stderr);
      const specErrorMessage = match && match[1] || wasmSpecOutput.stdout + wasmSpecOutput.stderr;
      const newJsFile = `
// check environment for wasm regen
var ENVIRONMENT_IS_NODE = typeof require !== "undefined";
if (ENVIRONMENT_IS_NODE) {
  Module["arguments"] = process.argv.slice(1);
}

// {{PRE_RUN_ADDITIONS}}
if (WebAssembly.validate(Module["readBinary"]())) {
    throw new Error(\`Fatal error: Expected binary to be invalid because: ${specErrorMessage}\`);
}
// {{POST_RUN_ADDITIONS}}
`;
      await fs.writeFileAsync(jsFile, newJsFile);
    }
  } else if (validate) {
    console.warn("WebAssembly spec interpreter is missing, unable to do validation");
  }

  let oldFile = (await fs.readFileAsync(jsFile)).toString();
  const fd = await fs.openAsync(jsFile, "w");
  await fs.writeAsync(fd, `// Generated with options: ${randomOptions.join(" ")}\n\n`);
  if (shouldInlineWasm) {
    const wasmBuffer = await fs.readFileAsync(wasmFile, "binary");
    let string = "";
    for (let i = 0; i < wasmBuffer.length; ++i) {
      string += `\\x${wasmBuffer.charCodeAt(i).toString(16).padStart(2, "0")}`;
    }
    const buf = `
// {{PRE_WASM_EXPRGEN}}
var Module = Module || {};
var wasmBuffer = "${string}";
Module["readBinary"] = function(file) {
  var buffer = new ArrayBuffer(wasmBuffer.length);
  var view = new Uint8Array(buffer);
  for (var i = 0; i < wasmBuffer.length; ++i) {
    view[i] = wasmBuffer.charCodeAt(i);
  }
  return view;
}
\n\n// {{POST_WASM_EXPRGEN}}\n\n
`;
    await fs.writeAsync(fd, buf);

    const nodeRegenOption =
`
if (ENVIRONMENT_IS_NODE && Module["arguments"].indexOf("--regen-wasm") !== -1) {
  var wasmBinaryFile = Module['wasmBinaryFile'] || "${path.basename(wasmFile)}";
  var bin = Module["readBinary"](wasmBinaryFile);
  var wstream = require("fs").createWriteStream(wasmBinaryFile, {defaultEncoding: "binary"});
  wstream.write(Buffer.from(bin.buffer));
  wstream.end();
  wstream.on("finish", function() {
    console.log("WebAssembly binary buffer written to " + wasmBinaryFile);
  });
} else {
`;
    oldFile = oldFile.replace("{{PRE_RUN_ADDITIONS}}", `{{PRE_RUN_ADDITIONS}}\n${nodeRegenOption}`);
    oldFile = oldFile.replace("// {{POST_RUN_ADDITIONS}}", "}\n// {{POST_RUN_ADDITIONS}}");
  }
  await fs.writeAsync(fd, oldFile);
  await fs.closeAsync(fd);

  return {
    src: sourceFile,
    js: jsFile,
    wasm: wasmFile,
    wast: wastFile,
    valid: isValid,
    wasmSpecOutput
  };
}

function getRandomEmscriptenOptions() {
  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomInt(_max, _min = 0) {
    const min = Math.ceil(_min);
    const max = Math.floor(_max) + 1;
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
    totalStack = getRandomInt(20, 1) * 1024 * 1024;
    options.push("-s", `TOTAL_STACK=${totalStack}`);
  }

  const doMemGrowth = roll(3);
  const wasmPageSize = 65536;
  if (doMemGrowth) {
    options.push("-s", "ALLOW_MEMORY_GROWTH=1");
  }

  let totalMem = 256 * wasmPageSize;
  if (!changedDefaultMem) {
    const changeTotalMem = roll(5);
    if (changeTotalMem) {
      changedDefaultMem = true;
      totalMem = (wasmPageSize * getRandomInt(16000)) | 0;
      options.push("-s", `TOTAL_MEMORY=${totalMem}`);
    }
  }
  if (changedDefaultMem && !doMemGrowth) {
    var totalMemory = wasmPageSize;
    while (totalMemory < totalMem || totalMemory < 2 * totalStack) {
      if (totalMemory < 16 * 1024 * 1024) {
        totalMemory *= 2;
      } else {
        totalMemory += 16 * 1024 * 1024;
      }
    }
    options.push("-s", `TOTAL_MEMORY=${totalMemory >>> 0}`);
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
