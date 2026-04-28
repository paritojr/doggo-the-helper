import { SlashCommandBuilder } from 'discord.js';
import { coinz } from "../database.js";

const balances = coinz;
const STARTING_BALANCE = 1000;

export default {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('pay coinz to an user')
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
      
      if (!balances.has(sender.id)) balances.set(sender.id, STARTING_BALANCE);
      if (!balances.has(target.id)) balances.set(target.id, STARTING_BALANCE);
      
      balances.set(sender.id, balances.get(sender.id) - amount);
      balances.set(target.id, balances.get(target.id) + amount);
      
      await interaction.reply({
        content: `${sender} sent ${target} **${amount} coinz**!`
      });
    }
};
