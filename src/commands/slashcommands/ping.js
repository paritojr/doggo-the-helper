import { SlashCommandBuilder, MessageFlags } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("pings the bot")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    const botLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    return interaction.reply({
      content: `pong! hello ${interaction.user}!\nlatency (bot): ${botLatency}ms\nlatency (API): ${apiLatency}ms`,
      flags: MessageFlags.Ephemeral
    });
  },
};