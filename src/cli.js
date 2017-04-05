import yargs from "yargs";
import generate, {sourceTypes, compileFromSource} from "./generate";
import {outputDir} from "./init";
import build, {prepareEmscriptenConfig} from "./build";

const commonGenOptions = {
  outdir: {
    alias: "o",
    describe: "Output directory for the generated files",
    default: outputDir
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
  inline: {
    boolean: true,
    describe: "Inline the WebAssembly module in the javascript file"
  },
  silent: {
    alias: "s",
    boolean: true,
    describe: "Silently run generating tools"
  },
};

yargs
  .usage()
  .help()
  .alias("h", "help")
  .wrap(Math.min(yargs.terminalWidth() - 1, 120))
  .command({
    command: "config",
    desc: "Updates Emscripten configuration file for this machine",
    handler() {
      prepareEmscriptenConfig()
        .then(() => console.log("Configuration completed"))
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
    }
  })
  .command({
    command: "build",
    desc: "Build the tools needed",
    handler() {
      build()
        .then(() => console.log("Build completed"))
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
    }
  })
  .command({
    command: "gen",
    desc: "generate a random WebAssembly test file",
    builder: (_yargs) => _yargs
      .options({
        ...commonGenOptions,
        attempts: {
          alias: "a",
          number: true,
          describe: "Number of attempts to generate a file, 0 for infinite",
          default: 1,
        },
        type: {
          alias: "t",
          string: true,
          describe: "Type of source file generated",
          choices: ["c", "cpp", "cpp11"],
          default: "c"
        },
        fileName: {
          string: true,
          describe: "Name of the generated files (without extension)",
          default: "test"
        }
      }),
    handler: (argv) => {
      const args = {
        sourceType: sourceTypes[argv.type],
        validate: argv.validate,
        fileName: argv.fileName,
        outdir: argv.outdir,
        inlineWasm: argv.inline,
        execOptions: {},
      };
      if (argv.silent) {
        args.execOptions.stdio = "ignore";
      }
      doGenerate(generate, argv.attempts, args);
    }
  })
  .command({
    command: "regen",
    desc: "generate WebAssembly from a .c source file",
    builder: (_yargs) => _yargs
      .options({
        ...commonGenOptions,
        source: {
          required: true,
          string: true,
          describe: "Source file to regenerate"
        },
        emargs: {
          array: true,
          describe: "Extra arguments to pass to emcc"
        }
      }),
    handler: (argv) => {
      const args = {
        validate: argv.validate,
        sourceFile: argv.source,
        outdir: argv.outdir,
        inlineWasm: argv.inline,
        execOptions: {},
        emOptions: argv.emargs || []
      };
      if (argv.silent) {
        args.execOptions.stdio = "ignore";
      }
      doGenerate(compileFromSource, 1, args);
    }
  })
  .demand(1)
  .argv;

async function doGenerate(genFn, maxAttempts, args) {
  let nAttempts = 0;
  while (maxAttempts === 0 || nAttempts < maxAttempts) {
    nAttempts++;
    try {
      const {wasm, src, js, valid} = await genFn(args);
      console.log(`Source file: ${src}`);
      console.log(`Javascript file: ${js}`);
      console.log(`WebAssembly file: ${wasm}${args.validate ? ` is ${valid ? "" : "not "}valid` : ""}`);
      return;
    } catch (e) {
      console.log("Failed to generate test");
      console.error(e);
    }
  }
}
