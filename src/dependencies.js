import {rootDir, binDirectory, isWindows} from "./init";
import path from "path";
import fs from "fs-extra";
import which from "which";


async function fromPath(bin) {
  try {
    const rPath = await which.async(bin);
    return rPath;
  } catch (e) {
    if (e.message.indexOf("not found") === -1) {
      throw e;
    }
  }
  return null;
}

async function fileExists(p) {
  try {
    await fs.statAsync(p);
    return true;
  } catch (e) {
    // ignore
  }
  return false;
}

let msbuildCache;
async function searchForMsBuild() {
  if (!isWindows) {
    return null;
  }
  if (msbuildCache) {
    return msbuildCache;
  }
  const cache = p => {
    msbuildCache = p;
    console.log(`MsBuild path: ${p}`);
    return msbuildCache;
  }
  const rPath = await fromPath("msbuild.exe");
  if (rPath) {
    // use the one on path
    return cache(rPath);
  }
  const versions = ["14.0", "12.0", "10.0"];
  for (const version of versions) {
    const paths = [
      path.resolve(process.env["ProgramFiles"], "msbuild", version, "bin/x86"),
      path.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin"),
      path.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin/amd64"),
    ];
    for (const p of paths) {
      const msbuildPath = path.join(p, "msbuild.exe");
      if (await fileExists(msbuildPath)) {
        return cache(msbuildPath);
      }
    }
  }
  throw new Error("MsBuild is missing");
}

export async function csmithDependencies() {
  const dependencies = {
    msbuild: await searchForMsBuild()
  };
  if (isWindows) {
    dependencies.m4 = path.join(rootDir, "third_party", "m4.exe");
  } else {
    dependencies.m4 = await which.async("m4");
  }
  return dependencies;
}

export async function llvmDependencies() {
  const dependencies = {
    cmake: await which.async("cmake"),
    msbuild: await searchForMsBuild(),
    make: isWindows ? null : await which.async("make"),
  };
  return dependencies;
}

export async function generateDependencies() {
  const csmithName = isWindows ? "csmith.exe" : "csmith";
  const csmithExe = await fromPath(csmithName) || path.join(binDirectory.csmith, csmithName);
  try {
    await fs.statAsync(csmithExe);
  } catch (e) {
    console.log(`Unable to find ${csmithExe}. Make sure it is built, run "npm run build-tools"`);
    return;
  }
  const clangName = isWindows ? "clang.exe" : "clang";
  const clangExe = await fromPath(clangName) || path.join(binDirectory.llvm, clangName);
  try {
    await fs.statAsync(clangExe);
  } catch (e) {
    console.log(`Unable to find ${clangExe}. Make sure it is built, run "npm run build-tools"`);
    return;
  }

  return {
    csmith: csmithExe
  };
}
