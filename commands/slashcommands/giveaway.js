import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { isContentFlagged } from "../../utils/isContentFlagged.js";
import { parseTime } from "../../utils/parseTime.js";
import { activeGiveaways } from "../database.js";
import { stopGiveaway } from "../../utils/stopGiveaway.js";

export default {
   data: new SlashCommandBuilder()
      .setName('giveaway')
      .setDescription('creates or manages giveaways')
      .addSubcommand(subcommand =>
         subcommand
         .setName('start')
         .setDescription('start a giveaway')
         .addStringOption(option =>
            option.setName('prize')
            .setDescription('the giveaway prize :O')
            .setRequired(true))
         .addStringOption(option =>
            option.setName('time')
            .setDescription('giveaway duration (examples: 1d, 2h, 10m)')
            .setRequired(true))
      )
      .addSubcommand(subcommand =>
         subcommand
         .setName('stop')
         .setDescription('stops da giveaway based on id')
         .addStringOption(option =>
            option.setName('id')
            .setDescription('ID of the giveaway')
            .setRequired(true))
      ),

   async execute(interaction, client) {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "stop") {
         const giveawayId = interaction.options.getString("id");
         const giveaway = activeGiveaways.get(giveawayId);
         if (!giveaway) {
            return interaction.reply({
               content: "giveaway not found (my bad)",
               ephemeral: true,
            });
         }
         await stopGiveaway(giveawayId);
      } else if (subcommand === "start") {
         const prize = interaction.options.getString("prize");
         const time1 = interaction.options.getString("time");
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
            .setTitle(`${prize} giveaway!`)
            .setDescription(`react with 🎉 to enter!`)
            .addFields(
               { name: "duration", value: time1, inline: true },
               { name: "winners", value: "1", inline: true })
            .setColor("#3060f1").setFooter({ text: "good luck to everyone!" })
            .setTimestamp();
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
         activeGiveaways.set(giveawayId, {
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
   },
};