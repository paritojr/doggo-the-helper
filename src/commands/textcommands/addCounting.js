import { countingChannels } from '../../db.js';
import config from "../../../config.json" with { type: "json" };
export default {
  name: "addcounting",
  description: "add a counting game",
  modOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has("ManageGuild") && !message.member.permissions.has("Administrator")) {
      return;
    }
    if (!args[0]) {
      return message.reply(`usage: \\${config.prefix}addcounting #channel <goal>`);
    }
    const channelMention = args[0];
    const goalArg = args[1];
    if (!channelMention.startsWith('<#') || !channelMention.endsWith('>')) {
      return message.reply(`usage: \\${config.prefix}addcounting #channel <goal>`);
    }
    const channelId = channelMention.slice(2, -1);
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
      return message.reply('channel not found');
    }

    const goal = parseInt(goalArg, 10);
    if (isNaN(goal) || goal <= 0) {
      return message.reply('provide a valid number for goal');
    }
    if (countingChannels.has(channel.id)) {
      return message.reply('that channel has already a counting game lol');
    }
    
    countingChannels.set(channel.id, {
      current: 0,
      goal,
      lastUser: null,
      highest: 0
    });
    
    return message.reply(`counting game added to ${channel}! the goal is: ${goal}`);
  }
};