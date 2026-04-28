const { isContentFlagged } = require("../../utils/isContentFlagged.js")
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
   data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('ask the mighty 8 ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('the question lmao')
                .setRequired(true)),

   async execute(interaction) {
      const answers = [
         "it is certain",
         "without a doubt",
         "you may rely on it",
         "ask again later",
         "can't predict it now",
         "my sources say no",
         "very doubtful",
         "yes",
         "no",
         "pls stop",
         "stfu",
         "nuhuh"
      ];
      const question = interaction.options.getString('question');
      const isFlagged = await isContentFlagged(interaction.guild, question);
      if (isFlagged == true) {
         await interaction.reply({
            content: 'nuhuh, cant answer that',
            ephemeral: true
         });
         console.log("flagged");
         return;
      }
      const response = answers[Math.floor(Math.random() * answers.length)];
      const userEmbed = new EmbedBuilder()
         .setTitle(`the magic 8ball`)
         .setColor("#3060f1")
         .setDescription(`**question**: ${question}\n**8ball's answer**: ${response}`)
         .setFooter({
            text: "bruh"
         })
         .setTimestamp();
      await interaction.reply({
         embeds: [userEmbed],
      });
   }
};
