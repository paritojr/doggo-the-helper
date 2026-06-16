import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName("catfacts")
    .setDescription("show a fun cat fact")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    try {
      //god bless this api
      const response = await fetch("https://catfact.ninja/fact");
      if (!response.ok) {
        throw new Error(`api's status: ${response.status}`);
      }

      const data = await response.json();
      const embed = new EmbedBuilder()
        .setColor("#3060f1")
        .setTitle("Fun fact about cats:")
        .setDescription(data.fact)
        .setFooter({ text: "meow" })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.log(error);
      return interaction.reply({
        content: "failed to fetch cat fact",
        flags: MessageFlags.Ephemeral
      });
    }
  },
};