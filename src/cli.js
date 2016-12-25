import yargs from "yargs";
import generate from "./generate";

yargs
  .command({
    command: "gen",
    desc: "generate a random WebAssembly test file",
    //builder: (yargs) => yargs.default("value", "true"),
    handler: (argv) => {
      generate().then(() => console.log("test generated"), console.error);
    }
  })
  .demand(1)
  .argv;
