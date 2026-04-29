import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";

const runCommand = (command, options = {}) =>
  new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(stderr || error);
      resolve(stdout.trim());
    });
  });

async function updater() {
  try {
    const botCwd = process.cwd();

    const branch = await runCommand("git rev-parse --abbrev-ref HEAD", { cwd: botCwd });
    const local = await runCommand("git rev-parse HEAD", { cwd: botCwd });

    const remoteRaw = await runCommand(`git ls-remote origin ${branch}`, { cwd: botCwd });
    const remote = remoteRaw.split("\t")[0];

    if (!remote || local === remote) return;

    console.log("update found!");

    const lockPath = path.join(botCwd, "package-lock.json");
    const beforeLock = fs.existsSync(lockPath)
      ? fs.readFileSync(lockPath, "utf8")
      : null;

    await runCommand("git pull", { cwd: botCwd });

    const afterLock = fs.existsSync(lockPath)
      ? fs.readFileSync(lockPath, "utf8")
      : null;

    if (beforeLock !== afterLock) {
      await runCommand("npm ci", { cwd: botCwd });
    }

    spawn(process.argv[0], process.argv.slice(1), {
      cwd: botCwd,
      detached: true,
      stdio: "inherit",
    });
    
    process.exit(0);
  } catch (err) {
    console.error("updater error:", err);
  }
}

export { updater };