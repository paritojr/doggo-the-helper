import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } from "discord.js";
import { dailyMiaChannels } from "../../database.js";
import { scheduleDailyContent, clearDailyContent } from "../../utils/dailycontent.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dailymia")
    .setDescription("toggle daily mia in this channel")
    .setIntegrationTypes(0)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts([0]),

  async execute(interaction) {
    const channelId = interaction.channel.id;
    const channel = interaction.channel;
    const isEnabled = dailyMiaChannels.has(channelId);

    if (isEnabled) {
      clearDailyContent(channelId);
      dailyMiaChannels.delete(channelId);

      return interaction.reply({
        content: "daily mia disabled",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const now = new Date();
      const config = {
        hour: now.getHours(),
        minute: now.getMinutes(),
      };
      
      dailyMiaChannels.set(channelId, config);
      scheduleDailyContent(channelId, config);
      const msgEmbed = new EmbedBuilder()
        .setDescription("This channel will now receive daily Mia pictures!")
        .setColor("#2a62fd")
      await channel.send({
        embeds: [msgEmbed]
      });
      await channel.send(
        await fetch("https://media.paritojr.co/mia/totalmias.json")
          .then(res => res.json())
          .then(data => `https://media.paritojr.co/mia/mia${Math.floor(Math.random() * data.total) + 1}.jpg`)
      );
      return interaction.reply({
        content: `daily mia enabled!`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};