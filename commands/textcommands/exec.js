import { exec } from "child_process";
export default {
  name: "exec",
  description: "run commands on host machine",
  ownerOnly: true,
  async execute(message, args) {
    const command = args.join(" ");
    if (!command) {
      return message.reply("pls provide a command to execute, thx :)");
    }

    exec(command, (error, stdout, stderr) => {
      const output = (stdout || stderr || error?.message || "no output?")
        .slice(0, 1900);

      if (error) {
        return message.reply(
          `command executed: ${command}\noutput:\n\`\`\`${output}\`\`\``
        );
      }

      message.reply(
        `command executed: \`${command}\`\n\`\`\`sh\n${output}\n\`\`\``
      );
    });
  }
};