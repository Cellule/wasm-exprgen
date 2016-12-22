import path from "path";
import {isWindows, binDirectory} from "./init";
import fs from "fs-extra";
import {checkSubmodules} from "./git";
import {emscriptenDependencies} from "./dependencies";

const emscriptenFile = path.resolve(isWindows ? process.env.userprofile : "~/", ".emscripten");
async function main() {
  await checkSubmodules();
  try {
    fs.statSync(emscriptenFile);
    const backup = path.join(path.dirname(emscriptenFile), ".emscripten.backup");
    console.log(`${emscriptenFile} is already present, making a backup for you at ${backup}.`);
    await fs.moveAsync(emscriptenFile, backup, {clobber: true});
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
  const {python, runEmcc} = await emscriptenDependencies();
  await runEmcc();

  // Update .emscripten file
  const variables = {
    PYTHON: `'${python}'`,
    LLVM_ROOT: `'${binDirectory.llvm}'`,
    NODE_JS: `'${process.argv[0]}'`,
  };
  Object.keys(variables).forEach(key => {
    variables[key] = `${key}= ${variables[key].replace(/\\/g, "/")}`;
  });

  console.log(`Editing file ${emscriptenFile}
Updated paths:
  ${Object.keys(variables).map(key => variables[key]).join("\n  ")}
`);
  const content = (await fs.readFileAsync(emscriptenFile)).toString();
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; ++i) {
    for (const key in variables) {
      if (lines[i].startsWith(key)) {
        lines[i] = variables[key];
        Reflect.deleteProperty(variables, key);
        break;
      }
    }
  }
  // add keys that were missing at the end of the file
  for (const key in variables) {
    lines.push(variables[key]);
  }
  await fs.writeFileAsync(emscriptenFile, lines.join("\n"));
}

main()
  .catch(err => console.error(err));
