export default {
  name: "kick",
  async execute(message, args) {
    if (!message.member.permissions.has("KickMembers")) {
      return message.reply("you can't use this command, srry :(");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user.");

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await member.send(
        `You were kicked from **${message.guild.name}**\nReason: ${reason}`
      ).catch(() => {});

      await member.kick(reason);

      message.reply(`${member.user.tag} was kicked`);
    } catch (err) {
      console.error(err);
      message.reply("user couldn't be kicked.");
    }
  }
};