import {checkSubmodules} from "./git";

async function main() {
  await checkSubmodules();
}

main()
  .catch(err => console.error(err));
