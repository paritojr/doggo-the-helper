import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("send a random quote"),

  async execute(interaction) {
    try {
        await interaction.deferReply();
        const res = await fetch('https://zenquotes.io/api/random');
        const json = await res.json();
        const quote = json[0];
        const embed = new EmbedBuilder()
          .setDescription(`${quote.q} - ${quote.a}`)
          .setColor(0x2b2d31);
        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        console.error(err);
    }
  },
};