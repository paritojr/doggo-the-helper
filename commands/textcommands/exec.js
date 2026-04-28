require("dotenv").config();
const { exec } = require("child_process");

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: "exec",
  async execute(message, args) {
    if (message.author.id !== OWNER_ID) {
      return message.reply("nope.");
    }

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
        `command executed: \`${command}\`\noutput:\n\`\`\`${output}\`\`\``
      );
    });
  }
};