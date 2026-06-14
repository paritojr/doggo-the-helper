import fs from "fs"
import path from "path";
import { client } from "./client.js"
import { fileURLToPath, pathToFileURL } from "url";
import config from "../config.json" with { type: "json" };
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prefix = config.prefix;

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

const textcmds = await loadCommands(
  path.join(__dirname, "commands", "textcommands"),
  c => c.name
);

const cooldowns = new Map();
const cooldownTime = 1000;

client.on("messageCreate", async (message) => {
   if (message.author.bot) return;
   if (!message.guild) return;
   const isOwner = message.author.id === process.env.OWNER_ID;
   if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = textcmds[commandName];
        if (!command) return;
        if (command.ownerOnly && !isOwner) return;

        const now = Date.now();
        const expirationTime = cooldowns.get("global") || 0;
        if (now < expirationTime) return;
        cooldowns.set("global", now + cooldownTime);
               
        try {
            await command.execute(message, args);
        } catch (err) {
            console.error("text command error:", err);
        }
    }
});