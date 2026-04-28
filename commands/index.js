import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadCommands(dir, getName) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
  const entries = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const module = await import(pathToFileURL(filePath).href);

      const cmd = module.default ?? module;
      const name = getName(cmd);

      if (name && cmd.execute) {
        return [name, cmd];
      }
      return null;
    })
  );

  return Object.fromEntries(entries.filter(Boolean));
}

const slashcmds = await loadCommands(
  path.join(__dirname, "slashcommands"),
  cmd => cmd.data?.name
);

const textcmds = await loadCommands(
  path.join(__dirname, "textcommands"),
  cmd => cmd.name
);

export { slashcmds, textcmds };