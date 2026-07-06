import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("pings the bot")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    const response = await interaction.reply({
      content: "pinging...",
      flags: MessageFlags.Ephemeral,
      withResponse: true
    });
    const msg = response.resource.message;
    const totalLatency = msg.createdTimestamp - interaction.createdTimestamp;
    return interaction.editReply({
      content: `pong! hello ${interaction.user}!\nbot latency: ${totalLatency}ms`
    });
  },
};