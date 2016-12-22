import "./init";
import {Repository, Submodule} from "nodegit";
import path from "path";
import fs from "fs-extra";

const rootDir = path.join(__dirname, "../..");

export async function checkSubmodules() {
  const repo = await Repository.open(rootDir);
  const submodules = [
    "clang",
    "csmith",
    "emscripten",
    "emscripten-fastcomp",
  ];
  for(const name of submodules) {
    const status = await Submodule.status(repo, name, Submodule.IGNORE.NONE);
    if (status & Submodule.STATUS.WD_UNINITIALIZED) {
      console.log(`Initializing ${name}`);
      const submodule = await Submodule.lookup(repo, name);
      await submodule.update(1, Submodule.UPDATE.CHECKOUT);
    }
  }
  console.log("All submodules initialized");

  const fastcomp = await Submodule.lookup(repo, "emscripten-fastcomp");
  const clang = await Submodule.lookup(repo, "clang");
  const fastCompPath = path.join(rootDir, fastcomp.path());
  const clangPath = path.join(rootDir, clang.path());
  const symlink = path.join(fastCompPath, "tools/clang");
  let isSymlinked = false;
  try {
    const toolClangPath = await fs.realpathAsync(symlink);
    isSymlinked = clangPath == toolClangPath;
  } catch(e) {
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
