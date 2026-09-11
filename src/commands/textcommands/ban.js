import config from "../../../config.json" with { type: "json" };
export default {
  name: "ban",
  description: "bans an user",
  modOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has("BanMembers")) {
      return;
    }

    let member = message.mentions.members.first();
    if (!member && args[0]) {
      member = await message.guild.members.fetch(args[0]).catch(() => null);
    }
    if (!member) return message.reply(`usage: \\${config.prefix}ban @user/user id <reason>`);

    const someargs = (args[0] === member.id || args[0]?.includes(member.id)) ? args.slice(1) : args;
    const reason = someargs.join(" ") || "No reason provided";

    try {
      await member.send(
        `You were banned from **${message.guild.name}**\nReason: ${reason}`
      ).catch(() => {});

      await member.ban({ reason });

      message.reply(`${member.user.tag} was successfully banned`);
    } catch (err) {
      console.error(err);
      message.reply("I couldn't ban that user.");
    }
  }
};