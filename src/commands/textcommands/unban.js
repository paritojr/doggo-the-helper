export default {
  name: "unban",
  description: "unbans a user by user id",
  modOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has("BanMembers")) {
      return message.reply("you can't use this lol");
    }

    const userId = args[0];
    if (!userId) return message.reply("pls provide an user id");

    try {
      const bannedUser = await message.guild.bans.fetch(userId).catch(() => null);

      if (!bannedUser) {
        return message.reply("that user wasn't banned lol");
      }

      await message.guild.members.unban(userId);

      message.reply(`successfully unbanned ${bannedUser.user.tag}!!!`);
    } catch (err) {
      console.error(err);
      message.reply("i couldn't unban that user lol");
    }
  }
};