import {thirdParties} from "./init";
import path from "path";
import fs from "fs-extra";

export async function checkSubmodules() {
  const clangPath = thirdParties.clang;
  const symlink = path.join(thirdParties.llvm, "tools/clang");
  let isSymlinked = false;
  try {
    const toolClangPath = await fs.realpathAsync(symlink);
    isSymlinked = clangPath === toolClangPath;
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
  if (!isSymlinked) {
    console.log(`Creating symlink ${clangPath} => ${symlink}`);
    try {
      await fs.ensureSymlinkAsync(clangPath, symlink, "dir");
    } catch (e) {
      if (e.code === "EPERM") {
        console.warn(`You need to be administrator to create a symlink.
Either rerun with administrative priviledges, create symlink manually or copy clang to fastcomp tools`);
      } else {
        throw e;
      }
    }
  }
}
