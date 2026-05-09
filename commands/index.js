import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadCommands(dir, getName) {
  const out = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    const cmd = mod.default ?? mod;
    const name = getName(cmd);
    if (name && cmd.execute) out[name] = cmd;
  }
  return out;
}

export const slashcmds = await loadCommands(
  path.join(__dirname, "slashcommands"),
  c => c.data?.name
);

export const textcmds = await loadCommands(
  path.join(__dirname, "textcommands"),
  c => c.name
);