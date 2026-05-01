import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { coinz } from "../database.js";
const balances = coinz;
const STARTING_BALANCE = 1000;
export default {
   data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('flip a coin!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('amount of coinz to bet')
                .setMinValue(1)
                .setRequired(true))
         .addStringOption(option =>
            option.setName('choice')
               .setDescription('choose: heads or tails?')
               .setRequired(true)
               .addChoices(
                  { name: 'Heads', value: 'heads' },
                  { name: 'Tails', value: 'tails' }
               )
         ),

   async execute(interaction) {
      const userId = interaction.user.id;
      let balance = balances.get(userId);
      const choice = interaction.options.getString('choice');
      const bet = interaction.options.getInteger('bet');

      if (!balances.has(userId)) {
        balances.set(userId, STARTING_BALANCE);
      }

      const results = ['heads', 'tails'];
      const flip = results[Math.floor(Math.random() * results.length)];
      const win = choice === flip;
      const winnings = win ? bet : -bet;
      balance += winnings;
      balances.set(userId, balance);

      const userEmbed = new EmbedBuilder()
      .setTitle(`coin flip results`)
      .setColor("#3060f1")
      .addFields(
        { name: 'your choice', value: `**${choice}**`, inline: true },
        { name: 'result', value: `**${flip}**`, inline: true },
        { name: 'outcome', value: win ? 'you won 🎉' : 'you lost 💀', inline: true },
        { name: 'change:', value: `${winnings}`, inline: true },
        { name: 'balance:', value: `${balance}`, inline: true },
      )
      .setFooter({
         text: "wowsers"
      })
      .setTimestamp();
      await interaction.reply({
         embeds: [userEmbed],
      });
   }
};
