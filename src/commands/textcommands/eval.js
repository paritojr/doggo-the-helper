export default {
  name: "eval",
  description: "runs code on da bot",
  ownerOnly: true,
  async execute(message, args) {
    const code = args.join(" ");
    if (!code) return;
    try {
      eval(code);
      message.delete();
    } catch (err) {
      message.reply(`fucking error:\n\`\`\`js\n${err}\n\`\`\``);
    }
  }
};