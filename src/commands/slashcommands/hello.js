import { SlashCommandBuilder, MessageFlags } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("says hello to you")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    return interaction.reply({
      content: "hello there!",
      flags: MessageFlags.Ephemeral
    });
  },
};