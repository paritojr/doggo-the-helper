import { SlashCommandBuilder } from 'discord.js';
import { coinz } from "../database.js";
import { initCoinz } from "../../utils/initcoinz.js";

const balances = coinz;

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription("shows an user's coinz balance")
        .addUserOption(option =>
            option.setName('user')
                .setDescription("check another user's balance ig")
                .setRequired(false)),

    async execute(interaction) {
      const target = interaction.options.getUser("user") || interaction.user;
      const userId = target.id;
      initCoinz(userId);
      const userBalance = balances.get(userId);
      await interaction.reply({
        content: `${target} has **${userBalance} coinz**`
      });
    }
};
