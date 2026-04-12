const { EmbedBuilder } = require("discord.js");
const { isContentFlagged } = require("../utils/isContentFlagged.js")
async function embedcommand(interaction) {
   const title = interaction.options.getString("title");
   const description = interaction.options.getString("description");
   const color = interaction.options.getString("color");
   const footer = interaction.options.getString("footer") || null;
   const timestamp = interaction.options.getBoolean("timestamp") || false;
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
module.exports = {
   embedcommand
};