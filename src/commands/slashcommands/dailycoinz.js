import { coinz, dailycoinzt } from "../../database.js";
import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { initCoinz } from "../../utils/initcoinz.js";

const balances = coinz;
const dailyct = dailycoinzt;

const DAILY_AMOUNT = 100;
const COOLDOWN = 24 * 60 * 60 * 1000;

export default {
    data: new SlashCommandBuilder()
        .setName('dailycoinz')
        .setDescription('claim your daily coinz!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),

    async execute(interaction) {
      const sender = interaction.user;
      const userId = sender.id;
      initCoinz(userId);

      const now = Date.now();
      const lastClaim = dailyct.get(userId);
      
      if (lastClaim && now - lastClaim < COOLDOWN) {
        const timeLeft = COOLDOWN - (now - lastClaim);

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return interaction.reply({
          content: `you already claimed your daily coinz, come back in **${hours}h ${minutes}m**, k? thx :)`,
          flags: MessageFlags.Ephemeral
        });
      }

      balances.set(userId, balances.get(userId) + DAILY_AMOUNT);
      dailyct.set(userId, now);

      await interaction.reply({
        content: `${sender} got their daily **${DAILY_AMOUNT} coinz**!`
      });
    }
};
