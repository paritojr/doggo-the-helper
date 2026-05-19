import { dangerChannels } from "../../db.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "danger",
  description: "toggle anti-spam channels",
  modOnly: true,
  async execute(message) {
    if (!message.guild) return;

    if (!message.member.permissions.has("ManageGuild") && !message.member.permissions.has("Administrator")) {
      return message.channel.send("you can't use this!");
    }
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.channel.send("usage: !danger #channel");
    }

    if (dangerChannels.has(channel.id)) {
      dangerChannels.delete(channel.id);
      await message.channel.send("danger channel deleted");
      await message.delete().catch(() => {});
      return;
    }

    dangerChannels.add(channel.id);
    const msgEmbed = new EmbedBuilder()
        .setDescription("This channel is now a danger channel. Sending a message here will result in you getting a permanent ban.\n**THIS IS YOUR ONLY WARNING.**")
        .setColor("#2a62fd")
    await channel.send({
        embeds: [msgEmbed]
    });
    await message.delete().catch(() => {});
  }
};