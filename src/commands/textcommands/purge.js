import config from "../../../config.json" with { type: "json" };
export default {
  name: "purge",
  description: "delete specific messages from an user",
  modOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has("ManageMessages")) {
      return;
    }
    if (!args || args.length === 0) {
      return message.reply(`usage: \\${config.prefix}purge @user/user id <amount>`);
    }

    const targetArg = args[0];
    const amountArg = args[1];
    let member = message.mentions.members.first();
    if (!member && targetArg) {
      member = await message.guild.members.fetch(targetArg).catch(() => null);
    }
    if (!member) {
      return message.reply(`usage: \\${config.prefix}purge @user/user id <amount>`);
    }

    let amount = parseInt(amountArg);
    if (!amountArg || isNaN(amount) || amount < 1 || amount > 50) {
      return message.reply("provide a valid number between 1-50 plz");
    }

    try {
      await message.delete().catch(() => {});
      const channelMessages = await message.channel.messages.fetch({ limit: 100 });
      const userMessages = channelMessages
        .filter(msg => msg.author.id === member.id)
        .first(amount);

      if (userMessages.length === 0) return await message.channel.send(`no recent messages from ${member.user.tag} bruh`);

      const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const newMessages = userMessages.filter(msg => msg.createdTimestamp > fourteenDaysAgo);
      const oldMessages = userMessages.filter(msg => msg.createdTimestamp <= fourteenDaysAgo);

      let totalDeleted = 0;

      if (newMessages.length > 0) {
        const deleted = await message.channel.bulkDelete(newMessages, true);
        totalDeleted += deleted.size;
      }

      //for messages older than 14 days, this is the solution
      //and i have all the rights to hate it
      if (oldMessages.length > 0) {
        for (const msg of oldMessages) {
          await msg.delete().catch(() => {});
          totalDeleted++;
        }
      }

      await message.channel.send(`successfully deleted **${totalDeleted}** messages from ${member.user.tag}!`);
    } catch (err) {
      console.error(err);
      message.reply("i couldn't purge the messages :(");
    }
  }
};