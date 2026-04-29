import { EmbedBuilder } from "discord.js";
import { activeGiveaways } from "../commands/database.js";

export async function stopGiveaway(client, giveawayId) {
   const giveaway = activeGiveaways.get(giveawayId);
   if (!giveaway) return;

   try {
      const channel = await client.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(giveaway.messageId);

      const reaction = message.reactions.cache.get("🎉");

      if (!reaction) {
         await channel.send("a giveaway ended but there were no participants :(");
         activeGiveaways.delete(giveawayId);
         return;
      }

      const users = await reaction.users.fetch();
      const participants = users.filter(user => !user.bot);

      if (participants.size === 0) {
         await channel.send("a giveaway ended but there were no participants :(");
         activeGiveaways.delete(giveawayId);
         return;
      }

      const participantArray = Array.from(participants.values());
      const winners = [];

      for (let i = 0; i < Math.min(giveaway.winners, participantArray.length); i++) {
         const randomIndex = Math.floor(Math.random() * participantArray.length);
         winners.push(participantArray.splice(randomIndex, 1)[0]);
      }

      const winnerList = winners.map(w => `<@${w.id}>`).join(", ");

      const winnerEmbed = new EmbedBuilder()
         .setTitle("🎉 GIVEAWAY ENDED! 🎉")
         .setDescription(`**Prize:** ${giveaway.prize}\n**Winner:** ${winnerList}`)
         .setColor("#00FF00")
         .setTimestamp();

      await channel.send({ embeds: [winnerEmbed] });

      activeGiveaways.delete(giveawayId);
   } catch (err) {
      console.error("error ending giveaway:", err);
   }
}