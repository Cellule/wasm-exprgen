import {rootDir, binDirectory, isWindows} from "./init";
import path from "path";
import fs from "fs-extra";
import which from "which";

async function fromPath(bin, opt = {}) {
  try {
    const rPath = await which.async(bin, opt);
    return rPath;
  } catch (e) {
    if (e.message.indexOf("not found") === -1) {
      throw e;
    }
  }
  return null;
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
  };
  const paths = ["14.0", "12.0", "10.0"].map(version => [
    path.resolve(process.env.ProgramFiles, "msbuild", version, "bin/x86"),
    path.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin"),
    path.resolve(process.env["ProgramFiles(x86)"], "msbuild", version, "bin/amd64"),
  ].join(";")).join(";");

  const rPath = (await fromPath("msbuild.exe")) || (await fromPath("msbuild.exe", {path: paths}));
  if (rPath) {
    return cache(rPath);
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

export async function emscriptenDependencies() {
  const python = await fromPath("python");
  return {
    python
  };
}

export async function generateDependencies() {
  const csmithExe = await fromPath("csmith") || await which.async("csmith", {path: binDirectory.csmith});
  const clangExe = await fromPath("clang") || await which.async("clang", {path: binDirectory.llvm});

  return {
    csmith: csmithExe,
    clang: clangExe,
    ...(await emscriptenDependencies())
  };
}
