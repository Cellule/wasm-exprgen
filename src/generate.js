import {outputDir, toolsDirectory} from "./init";
import fs from "fs-extra";
import path from "path";
import {execFileAsync} from "child_process";
import {generateDependencies, emscriptenDependencies} from "./dependencies";

async function main() {
  const {csmith} = await generateDependencies();
  const {runEmcc} = await emscriptenDependencies();

  await fs.ensureDirAsync(outputDir);
  await execFileAsync(csmith, ["-o", "test.c"], {
    cwd: outputDir
  });
  /*
  await execFileAsync(csmithExe, ["-o", "test.cpp", "--lang-cpp"], {
    cwd: outputDir
  });
  await execFileAsync(csmithExe, ["-o", "test11.cpp", "--lang-cpp", "--cpp11"], {
    cwd: outputDir
  });
  */
  await runEmcc([
    "test.c",
    `-I${path.relative(outputDir, path.join(toolsDirectory, "csmith/inc"))}`,
    ..."-O3 -s WASM=1 -o test.js".split(" "),
    //"-s", "BINARYEN_METHOD='interpret-binary'",
  ], {cwd: outputDir});
}

main().catch(console.error);
