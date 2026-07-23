import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("send a random quote")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    try {
      await interaction.deferReply();
      const res = await fetch('https://zenquotes.io/api/random');
      const json = await res.json();
      const quote = json[0];
      const embed = new EmbedBuilder()
        .setDescription(`*"${quote.q}"*\n— ${quote.a}`)
        .setColor(0x2b2d31);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      try {
        await interaction.deleteReply();
      } catch (derr) {
        console.error("error (again wtf):", derr);
      }
    }
  },
};