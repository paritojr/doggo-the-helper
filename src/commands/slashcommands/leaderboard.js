import { SlashCommandBuilder } from "discord.js";
import { coinz } from "../../db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("show richest users")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    const entries = [...coinz.entries()];
    if (!entries.length) {
      return interaction.reply("no data lmao");
    }

    const sorted = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const description = sorted
      .map(([userId, coins], i) =>
        `**${i + 1}.** <@${userId}> — ${coins} coinz`
      )
      .join("\n");

    return interaction.reply({
      content: description,
    });
  },
};