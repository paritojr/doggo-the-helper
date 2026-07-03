import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { coinz } from "../../database.js";
import { initCoinz } from "../../utils/initcoinz.js";

const balances = coinz;

export default {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('pay coinz to an user')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user to send coinz')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('amount of coinz to giv')
                .setMinValue(1)
                .setRequired(true)),

    async execute(interaction) {
      const sender = interaction.user;
      const target = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      
      if (sender.id === target.id) {
         return interaction.reply({
            content: `you can't send coinz to yourself bruh`,
            flags: MessageFlags.Ephemeral
         });
      }

      if (target.bot) {
         return interaction.reply({
            content: `dude...`,
            flags: MessageFlags.Ephemeral
         });
      }

      initCoinz(sender.id);
      initCoinz(target.id);
      
      const senderB = balances.get(sender.id);
      if (senderB < amount) {
         return interaction.reply({
            content: `yee don't have enough coinz bro`,
            flags: MessageFlags.Ephemeral
         });
      }

      balances.set(sender.id, balances.get(sender.id) - amount);
      balances.set(target.id, balances.get(target.id) + amount);
      
      await interaction.reply({
        content: `${sender} sent ${target} **${amount} coinz**!`
      });
    }
};
