const { EmbedBuilder } = require("discord.js");
async function randompet(interaction) {
   let finalUrl;
   let type;
   const roll = Math.random();
   if (roll < 0.5) {
      const res = await fetch('https://random.dog/woof.json');
      const data = await res.json();
      finalUrl = data.url;
      type = "dog";
   } else {
      const randomNumber = Math.floor(Math.random() * 1986);
      const res = await fetch(`https://cataas.com/api/cats?limit=1&skip=${randomNumber}`);
      const data = await res.json();
      finalUrl = `https://cataas.com/cat/${data[0].id}`;
      type = "cat";
   }
   const userEmbed = new EmbedBuilder()
      .setTitle(`${interaction.user.tag}'s random ${type}!`)
      .setColor("#3060f1")
      .setImage(finalUrl)
      .setFooter({
         text: "fantastic"
      })
      .setTimestamp();
   await interaction.reply({
      embeds: [userEmbed],
   });
}
module.exports = {
   randompet
};