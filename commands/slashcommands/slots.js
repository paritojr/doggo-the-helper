const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { coinz } = require("../database.js");

const balances = coinz;
const STARTING_BALANCE = 1000;

const symbols = ["🍒", "🍋", "🍉", "⭐", "💎", "7️⃣", "🍇", "🍊",];
function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('play slots game')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('amount of coinz to bet')
                .setMinValue(1)
                .setRequired(true)),

    async execute(interaction) {
      const userId = interaction.user.id;
      const bet = interaction.options.getInteger("bet");
      if (!balances.has(userId)) {
        balances.set(userId, STARTING_BALANCE);
      }
      let balance = balances.get(userId);
      if (bet <= 0) {
        return interaction.reply({ content: "bet must be more than 0 lol", ephemeral: true });
      }
      if (bet > balance) {
        return interaction.reply({
          content: `srry but you only have ${balance} coinz :)`,
          ephemeral: true,
        });
      }
    
      const s1 = getRandomSymbol();
      const s2 = getRandomSymbol();
      const s3 = getRandomSymbol();
    
      const msg = await interaction.reply({
        content: "🎰 spinning...",
        fetchReply: true,
      });
    
      //suspense is always a great option
      await sleep(900);
      await msg.edit(`${s1} | ❓ | ❓`);
    
      await sleep(900);
      await msg.edit(`${s1} | ${s2} | ❓`);
    
      await sleep(900);
      await msg.edit(`${s1} | ${s2} | ${s3}`);
    
      let winnings = 0;
      let resultText = "";
    
      //tf i was doing with this one
      if (s1 === s2 && s2 === s3) {
        winnings = bet * 5;
        resultText = "TRIPLE-PAIR??? YOOOOOOO!!!! 🎉";
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        winnings = bet * 2;
        resultText = "2-pair, nice";
      } else {
        winnings = -bet;
        resultText = "you lost 💀";
      }
    
      balance += winnings;
      balances.set(userId, balance);
    
      const embed = new EmbedBuilder()
        .setTitle("🎰 RESULTS")
        .setDescription(`${s1} | ${s2} | ${s3}`)
        .addFields(
          { name: "final result", value: resultText, inline: true },
          { name: "change", value: `${winnings} coinz`, inline: true },
          { name: "balance", value: `${balance} coinz`, inline: true }
        )
        .setColor(winnings > 0 ? "Green" : "Red");
    
      await sleep(500);
      await msg.edit({ content: null, embeds: [embed] });
    }
};