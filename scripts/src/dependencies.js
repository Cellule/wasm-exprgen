import "./init";
import os from "os";
import path from "path";
import fs from "fs-extra";
import which from "which";

const isWindows = os.platform() === "win32";

async function checkBinary(bin) {
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

async function searchForMsBuild() {
  if (!isWindows) {
    throw new Error("MsBuild is only used on Windows");
  }
  const rPath = await checkBinary("msbuild.exe");
  if (rPath) {
    // use the one on path
    return rPath;
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
        return msbuildPath;
      }
    }
  }
  return null;
}

export async function checkCSmithDependencies() {
  const dependencies = {};
  if (isWindows) {
    // Search for msbuild
    const msbuild = await searchForMsBuild();
    if (!msbuild) {
      throw new Error("MsBuild is missing");
    }
    console.log(`MsBuild path: ${msbuild}`);
    dependencies.msbuild = msbuild;
  }
  return dependencies;
}

