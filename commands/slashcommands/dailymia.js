import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { dailyMiaChannels } from "../database.js";
import { scheduleDailyContent, clearDailyContent } from "../../utils/dailycontent.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dailymia")
    .setDescription("toggle daily mia in this channel"),

  async execute(interaction) {
    const channelId = interaction.channel.id;
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
      scheduleDailyContent(interaction.client, channelId, config, dailyMiaChannels);

      return interaction.reply({
        content: `daily mia enabled!`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};