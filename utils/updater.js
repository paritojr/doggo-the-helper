const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const runCommand = (command, options = {}) =>
  new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(stderr || error);
      resolve(stdout.trim());
    });
  });

const LOCK_FILE = path.join(process.cwd(), ".updater.lock");
const currentScript = __filename;

async function updater() {
  try {
    if (fs.existsSync(LOCK_FILE)) return;
    fs.writeFileSync(LOCK_FILE, "1");

    let pm2Installed = false;
    let botCwd = process.cwd();
    let pm2ProcessName = null;

    try {
      await runCommand("pm2 -v");
      pm2Installed = true;

      const pm2List = await runCommand("pm2 jlist");
      const processes = JSON.parse(pm2List);

      const botProcess = processes.find(
        p => path.resolve(p.pm2_env.pm_exec_path) === path.resolve(currentScript)
      );

      if (botProcess) {
        botCwd = botProcess.pm2_env.pm_cwd;
        pm2ProcessName = botProcess.name || botProcess.pm2_env.name;
      }
    } catch {}

    await runCommand("git fetch", { cwd: botCwd });

    const branch = await runCommand("git rev-parse --abbrev-ref HEAD", {
      cwd: botCwd,
    });

    let local, remote;

    try {
      local = await runCommand("git rev-parse HEAD", { cwd: botCwd });
      remote = await runCommand(`git rev-parse origin/${branch}`, {
        cwd: botCwd,
      });
    } catch {
      return;
    }

    if (local === remote) {
      console.log("[doggo updater] up to date");
      return;
    }

    await runCommand("git pull", { cwd: botCwd });
    await runCommand("npm install", { cwd: botCwd });

    console.log("[doggo updater] updated");

    if (pm2Installed) {
      if (pm2ProcessName) {
        await runCommand(`pm2 restart ${pm2ProcessName}`);
      } else {
        await runCommand("pm2 restart all");
      }
    } else {
      process.exit(0);
    }
  } catch {
  } finally {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  }
}

module.exports = { updater };