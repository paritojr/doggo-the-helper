import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from "discord.js";
import { coinz } from "../../database.js";
import { initCoinz } from "../../utils/initcoinz.js";
const balances = coinz;

export default {
   data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('flip a coin!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
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
      initCoinz(userId);
      let balance = balances.get(userId);
      const choice = interaction.options.getString('choice');
      const bet = interaction.options.getInteger('bet');

      if (balance < bet) {
         return interaction.reply({
            content: "you don't have enough coinz...",
            flags: MessageFlags.Ephemeral
         });
      }

      const results = ['heads', 'tails'];
      const flip = results[Math.floor(Math.random() * results.length)];
      const win = choice === flip;
      const winnings = win ? bet : -bet;
      balance += winnings;
      balances.set(userId, balance);

      const userEmbed = new EmbedBuilder()
        .setTitle(win ? 'you won! 🎉' : 'you lost 💀')
        .setColor(win ? '#2ecc71' : '#e74c3c')
        .addFields(
          { name: 'your choice', value: `**${choice}**`, inline: true },
          { name: 'result', value: `**${flip}**`, inline: true },
          { name: 'balance:', value: `${balance}`, inline: false },
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