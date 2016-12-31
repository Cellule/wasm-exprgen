import yargs from "yargs";
import generate, {sourceTypes} from "./generate";
import {outputDir} from "./init";

yargs
  .usage()
  .help()
  .alias("h", "help")
  .wrap(Math.min(yargs.terminalWidth() - 1, 120))
  .command({
    command: "gen",
    desc: "generate a random WebAssembly test file",
    builder: (yargs) => yargs
      .options({
        attempts: {
          alias: "a",
          number: true,
          describe: "Number of attempts to generate a file, 0 for infinite",
          default: 1,
        },
        outdir: {
          alias: "o",
          describe: "Output directory for the generated files",
          default: outputDir
        },
        type: {
          alias: "t",
          string: true,
          describe: "Type of source file generated",
          choices: ["c", "cpp", "cpp11"],
          default: "c"
        },
        validate: {
          boolean: true,
          describe: "Run wasm-spec interpreter to validate generated file",
          default: true
        },
        interpreted: {
          boolean: true,
          describe: "Generate interpreted version for comparison purposes",
          default: true
        },
        "src-name": {
          string: true,
          describe: "Name of the source file (without extension)",
          default: "test"
        },
        "wasm-name": {
          string: true,
          describe: "Name of the WebAssembly javascript file (without extension)",
          default: "test"
        },
        "interpreted-name": {
          string: true,
          describe: "Name of the javascript file for interpreted version (without extension)",
          default: "interpreted"
        },
        silent: {
          alias: "s",
          boolean: true,
          describe: "Silently run generating tools"
        }
      }),
    handler: (argv) => {
      const args = {
        sourceType: sourceTypes[argv.type],
        validate: argv.validate,
        interpreted: argv.interpreted,
        srcFileName: argv.srcName,
        wasmFileName: argv.wasmName,
        interpretedFileName: argv.interpretedName,
        outdir: argv.outdir,
        execOptions: {},
      };
      if (argv.silent) {
        args.execOptions.stdio = "ignore";
      }
      doGenerate(argv.attempts, args);
    }
  })
  .demand(1)
  .argv;

async function doGenerate(maxAttempts, args) {
  let nAttempts = 0;
  while (maxAttempts === 0 || nAttempts < maxAttempts) {
    nAttempts++;
    try {
      const {wasm, src, interpret} = await generate(args);
      console.log(`Source file: ${src}`);
      console.log(`WebAssembly file: ${wasm}`);
      if (interpret) {
        console.log(`Javascript file: ${interpret}`);
      }
      return;
    } catch (e) {
      console.log("Failed to generate test");
      console.error(e);
    }
  }
}
