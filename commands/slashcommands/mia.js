import { SlashCommandBuilder, MessageFlags } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName("mia")
    .setDescription("sends a random mia pic"),

  async execute(interaction) {
    try {
      const apiUrl = "http://media.paritojr.co";
      const response = await fetch(`${apiUrl}/mia/totalmias.json`);
      const data = await response.json();
      const total = data.total;
      const randomNumber = Math.floor(Math.random() * total) + 1;

      return interaction.reply({
        content: `${apiUrl}/mia/mia${randomNumber}.jpg`,
      });
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "failed to fetch a mia pic :(",
        flags: MessageFlags.Ephemeral
      });
    }
  },
};