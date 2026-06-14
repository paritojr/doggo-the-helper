import fs from "fs"
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { MessageFlags, REST } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { client } from "./client.js"

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

const slashcmds = await loadCommands(
  path.join(__dirname, "commands", "slashcommands"),
  c => c.data?.name
);

const BOT_TOKEN = process.env.TOKEN;
async function start() {
    const cmdsarray = Object.values(slashcmds).map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
    try {
        console.log("started refreshing application (/) commands...");
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: cmdsarray,
        });
        console.log("successfully reloaded application (/) commands!");
    } catch (error) {
        console.error("error registering slash commands:", error);
    }
}
client.once("clientReady", start);
client.on("interactionCreate", async (interaction) => {
   if (!interaction.isChatInputCommand()) return;
   const { commandName } = interaction;

   try {
      const cmd = slashcmds[commandName];
      if (!cmd) {
         return interaction.reply({
            content: "Unknown command.",
            flags: MessageFlags.Ephemeral
         });
      }
      await cmd.execute(interaction);
   } catch (err) {
      console.error(err);
   }
});