import { countingChannels } from '../../db.js';
import config from "../../../config.json" with { type: "json" };

export default {
  name: "removecounting",
  description: "remove a counting game",
  modOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has("ManageGuild") && !message.member.permissions.has("Administrator")) {
      return message.channel.send("you can't use this!");
    }
    if (!args[0]) {
      return message.reply(`usage: \\${config.prefix}removecounting #channel`);
    }
    const channelMention = args[0];
    if (!channelMention.startsWith('<#') || !channelMention.endsWith('>')) {
      return message.reply(`usage: \\${config.prefix}removecounting #channel`);
    }

    const channelId = channelMention.slice(2, -1);
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
      return message.reply('channel not found');
    }

    if (!countingChannels.has(channel.id)) {
      return message.reply('that channel doesn\'t even have a counting game lol');
    }

    countingChannels.delete(channel.id);
    return message.reply(`removed counting game from <#${channel.id}>`);
  }
};
