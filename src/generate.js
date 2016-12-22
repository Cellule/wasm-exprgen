import {rootDir} from "./init";
import fs from "fs-extra";
import path from "path";
import {execFileAsync} from "child_process";
import {generateDependencies} from "./dependencies";

const outputDir = path.join(rootDir, "output");
async function main() {
  const {csmith} = await generateDependencies();
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

}

main().catch(console.error);
