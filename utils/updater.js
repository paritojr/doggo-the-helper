const { exec } = require("child_process");
const { spawn } = require("child_process");
const path = require("path");

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

    await runCommand("git fetch", { cwd: botCwd });

    const branch = await runCommand("git rev-parse --abbrev-ref HEAD", { cwd: botCwd });
    const local = await runCommand("git rev-parse HEAD", { cwd: botCwd });
    const remote = await runCommand(`git rev-parse origin/${branch}`, { cwd: botCwd });

    if (local !== remote) {
      await runCommand("git pull", { cwd: botCwd });
      await runCommand("npm ci", { cwd: botCwd });

      spawn(process.argv[0], process.argv.slice(1), {
        cwd: botCwd,
        detached: true,
        stdio: "inherit",
      });

      process.exit(0);
    }
  } catch {
    // do nothing
  }
}

module.exports = { updater };