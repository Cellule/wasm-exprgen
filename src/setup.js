import {checkSubmodules} from "./git";

checkSubmodules()
  .catch(err => console.error(err))
