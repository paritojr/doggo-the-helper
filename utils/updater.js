const { exec } = require("child_process");
const path = require('path');

async function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve(stdout.trim());
    });
  });
}
async function updater() {
  try {
    let pm2Installed = false;
    try {
      await runCommand("pm2 -v");
      pm2Installed = true;
      console.log("[doggo updater] PM2 detected.");
    } catch {
      console.log("[doggo updater] PM2 not installed, which means time to node");
    }

    let botCwd = process.cwd();
    if (pm2Installed) {
      const pm2List = await runCommand("pm2 jlist");
      const processes = JSON.parse(pm2List);
      const botProcess = processes.find(p => path.resolve(p.pm2_env.pm_exec_path) === currentScript);
      if (botProcess) {
        botCwd = botProcess.pm2_env.pm_cwd;
      }
    }

    console.log("[doggo updater] checking for updates...");
    await runCommand("git fetch", { cwd: botCwd });

    const local = await runCommand("git rev-parse HEAD", { cwd: botCwd });
    const remote = await runCommand("git rev-parse @{u}", { cwd: botCwd });

    if (local === remote) {
      console.log("[doggo updater] bot is up to date");
      return;
    }

    console.log("[doggo updater] new update!");
    const gitOutput = await runCommand("git pull", { cwd: botCwd });
    console.log("[doggo updater] git output:\n", gitOutput);

    console.log("[doggo updater] installing dependencies...");
    await runCommand("npm install", { cwd: botCwd });

    if (pm2Installed) {
      console.log("[doggo updater] restarting PM2 bot..");
      await runCommand(`pm2 restart ${process.argv[1]}`);
    } else {
      console.log("[doggo updater] restarting node process...");
      process.exit(0);
    }

    console.log("[doggo updater] update completed!");
  } catch (err) {
    console.error("[doggo updater] error:", err);
  }
}

module.exports = { updater };