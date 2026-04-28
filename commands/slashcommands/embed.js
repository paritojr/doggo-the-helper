const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isContentFlagged } = require("../../utils/isContentFlagged.js")

module.exports = {
   data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('creates a fantastic embed')
        .addStringOption(option =>
            option.setName('title')
                .setDescription("the embed's title :O")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('the description of the embed (use \\n for newlines)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('color in hex (example: #2a62fd)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('the footer of the embed')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('timestamp')
                .setDescription('choose whether to add a timestamp or not')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('add an image URL')
                .setRequired(false)),

   async execute(interaction) {
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");
      const color = interaction.options.getString("color");
      const footer = interaction.options.getString("footer") || null;
      const timestamp = interaction.options.getBoolean("timestamp") || false;
      const image = interaction.options.getString("image");
      const isTheColorValid = /^#[0-9A-Fa-f]{6}$/.test(color);
      if (!isTheColorValid) {
         await interaction.reply({
            content: "whoops! color property is invalid, pls try again",
            ephemeral: true
         });
         return;
      }
      const awesomeEmbed = new EmbedBuilder()
         .setTitle(title)
         .setDescription(description.replace(/\\n/g, '\n'))
         .setColor(color)
      if (timestamp) {
         awesomeEmbed.setTimestamp(Date.now());
      }
      if (footer != null) {
         awesomeEmbed.setFooter({
            text: footer
         });
      }
      if (image != null) {
         awesomeEmbed.setImage(image);
      }

      const isFlagged = await isContentFlagged(interaction.guild, `${title} ${description} ${footer}`);
      if (isFlagged == true) {
         await interaction.reply({ 
            content: 'nuhuh, cant say that', 
            ephemeral: true 
         });
         console.log("flagged");
         return;
      } else {
         await interaction.reply({ 
            content: 'done ig', 
            ephemeral: true 
         });
         await interaction.channel.send({
            embeds: [awesomeEmbed],
         });
      }
   }
};