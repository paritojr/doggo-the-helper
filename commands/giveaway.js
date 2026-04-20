const { EmbedBuilder } = require("discord.js");
const { isContentFlagged } = require("../utils/isContentFlagged.js");
const { parseTime } = require("../utils/parseTime.js");
async function giveaway(interaction, client) {
   const prize = interaction.options.getString("prize");
   const time1 = interaction.options.getString("time");
   const stopOption = interaction.options.getString("stop");
   async function stopGiveaway(givID) {
      const giveawayId = givID;
      const giveaway = client.activeGiveaways.get(giveawayId);
      try {
         const channel = await client.channels.fetch(giveaway.channelId);
         const message = await channel.messages.fetch(giveaway.messageId);
         const reaction = message.reactions.cache.get("🎉");
         if (!reaction) {
            await channel.send("a giveaway ended but there were no participants :(");
            client.activeGiveaways.delete(giveawayId);
            return;
         }
         const users = await reaction.users.fetch();
         const participants = users.filter((user) => !user.bot);
         if (participants.size === 0) {
            await channel.send("a giveaway ended but there were no participants :(");
            client.activeGiveaways.delete(giveawayId);
            return;
         }
         const participantArray = Array.from(participants.values());
         const winners = [];
         for (let i = 0; i < Math.min(giveaway.winners, participantArray.length); i++) {
            const randomIndex = Math.floor(Math.random() * participantArray.length);
            winners.push(participantArray.splice(randomIndex, 1)[0]);
         }
         const winnerList = winners.map((winner) => `<@${winner.id}>`).join(", ");
         const winnerEmbed = new EmbedBuilder().setTitle("🎉 GIVEAWAY ENDED! 🎉").setDescription(`**Prize:** ${giveaway.prize}\n**Winner${winners.length > 1 ? "s" : ""}:** ${winnerList}\n\ncongratulations! you won the giveaway!`, ).setColor("#00FF00").setTimestamp();
         await channel.send({
            embeds: [winnerEmbed]
         });
         client.activeGiveaways.delete(giveawayId);
      } catch (error) {
         console.error("error ending giveaway:", error);
      }
   }
   if (stopOption) {
      const giveaway = client.activeGiveaways.get(stopOption);
      if (!giveaway) {
         return interaction.reply({
            content: "giveaway not found (my bad)",
            ephemeral: true,
         });
      }
      await stopGiveaway(stopOption);
   } else {
      if (!prize || !time1) {
         await interaction.reply({
            content: "pls provide both prize and time for creating a giveaway",
            ephemeral: true,
         });
         return;
      }
      const duration = parseTime(time1);
      if (!duration) {
         await interaction.reply({
            content: "invalid time format, use format like: 1d, 5h, 30m",
            ephemeral: true,
         });
         return;
      }
      const isFlagged = await isContentFlagged(interaction.guild, prize);
      if (isFlagged == true) {
         await interaction.reply({
            content: 'nuhuh, cant say that',
            ephemeral: true
         });
         console.log("flagged");
         return;
      }
      const giveawayId = Date.now().toString();
      const endTime = Date.now() + duration;
      const giveawayEmbed = new EmbedBuilder()
         .setTitle(`${prize} giveaway!`).setDescription(`react with 🎉 to enter!`).addFields({
         name: "duration",
         value: time1,
         inline: true
      }, {
         name: "winners",
         value: "1",
         inline: true
      }, ).setColor("#3060f1").setFooter({
         text: "good luck to everyone!"
      }).setTimestamp();
      const giveawayMessage = await interaction.reply({
         content: "its giveaway time!!!! 🐾🎉",
         embeds: [giveawayEmbed],
         fetchReply: true,
      });
      await giveawayMessage.react("🎉");
      await interaction.followUp({
         content: `this is the giveaway id: ${giveawayId}, whenever you want to manually stop the giveaway, use this id`,
         ephemeral: true,
      });
      client.activeGiveaways.set(giveawayId, {
         messageId: giveawayMessage.id,
         channelId: interaction.channelId,
         guildId: interaction.guildId,
         prize: prize,
         winners: 1,
         endTime: endTime,
         hostId: interaction.user.id,
      });
      setTimeout(() => {
         stopGiveaway(giveawayId);
      }, duration);
   }
}
module.exports = {
   giveaway
};