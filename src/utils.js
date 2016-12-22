
export function waitUntilDone(proc) {
  return new Promise((resolve, reject) => {
    proc.on("exit", code => {
      if (code !== 0) {
        return reject(new Error(`Command terminated with exit code ${code}\n${proc.spawnargs.join(" ")}`));
      }
      resolve();
    });
    proc.on("error", err => reject(err));
  });
}
