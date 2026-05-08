import { SlashCommandBuilder, MessageFlags } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("says hello to you"),

  async execute(interaction) {
    return interaction.reply({
      content: "hello there!",
      flags: MessageFlags.Ephemeral
    });
  },
};