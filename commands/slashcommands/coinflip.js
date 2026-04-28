import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
export default {
   data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('flip a coin!'),

   async execute(interaction) {
      const results = ['heads', 'tails'];
      const flip = results[Math.floor(Math.random() * results.length)];
      const userEmbed = new EmbedBuilder()
      .setTitle(`coin flip results`)
      .setColor("#3060f1")
      .setDescription(`coin landed on ${flip}! yeah`)
      .setFooter({
         text: "wowsers"
      })
      .setTimestamp();
      await interaction.reply({
         embeds: [userEmbed],
      });
   }
};
