import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function loadCommands(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
  const commands = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const module = await import(pathToFileURL(filePath).href);
    const cmd = module.default ?? module;
    if (cmd?.name && cmd?.description && cmd?.execute) {
      commands.push(cmd);
    }
  }
  return commands;
}

export default {
  name: "help",
  description: "lists all commands",
  async execute(message) {
    const commandsPath = path.join(process.cwd(), "commands/textcommands");
    const commands = await loadCommands(commandsPath);

    const list = commands.filter(cmd => cmd?.description && !cmd.ownerOnly)
    .map(cmd => `**!${cmd.name}**: ${cmd.description}`)
    .join("\n");
    
    return message.channel.send(
      `text commands:\n${list}\n\nslash commands aren't shown here as discord already displays them btw`
    );
  }
};