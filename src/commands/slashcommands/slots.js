import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { coinz } from "../../db.js";
import { initCoinz } from "../../utils/initcoinz.js";

const balances = coinz;

const symbols = ["🍒", "🍋", "🍉", "⭐", "💎", "7️⃣", "🍇", "🍊",];
function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('play slots game')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('amount of coinz to bet')
                .setMinValue(1)
                .setRequired(true)),

    async execute(interaction) {
      const userId = interaction.user.id;
      const bet = interaction.options.getInteger("bet");
      initCoinz(userId);
      let balance = balances.get(userId);
      if (bet <= 0) {
        return interaction.reply({ content: "bet must be more than 0 lol", flags: MessageFlags.Ephemeral });
      }
      if (bet > balance) {
        return interaction.reply({
          content: `srry but you only have ${balance} coinz :)`,
          flags: MessageFlags.Ephemeral
        });
      }
    
      const s1 = getRandomSymbol();
      const s2 = getRandomSymbol();
      const s3 = getRandomSymbol();
    
      let winnings = 0;
      let resultText = "";
    
      //tf i was doing with this one
      if (s1 === "7️⃣" && s2 === "7️⃣" && s3 === "7️⃣") {
        winnings = bet * 20;
        resultText = "💎 JACKPOT!!!!";
      } else if (s1 === s2 && s2 === s3) {
        winnings = bet * 10;
        resultText = "TRIPLE-PAIR??? YOOOOOOO!!!! 🎉";
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        winnings = bet * 3;
        resultText = "2-pair, nice ✨";
      } else {
        winnings = -bet;
        resultText = "you lost 💀";
      }
    
      balance += winnings;
      balances.set(userId, balance);
      
      await interaction.reply({ content: "🎰 spinning..." });
      
      await sleep(900);
      await interaction.editReply(`${s1} | ❓ | ❓`);
      
      await sleep(900);
      await interaction.editReply(`${s1} | ${s2} | ❓`);
      
      await sleep(900);
      await interaction.editReply(`${s1} | ${s2} | ${s3}`);
      
      await sleep(500);
      await interaction.editReply(
        `${s1} | ${s2} | ${s3}\n\n${resultText}\nchange: ${winnings} coinz\nbalance: ${balance}`
      );
    }
};