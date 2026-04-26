const { coinz, dailycoinzt } = require("../database.js");

const balances = coinz;
const dailyct = dailycoinzt;

const STARTING_BALANCE = 1000;
const DAILY_AMOUNT = 100;
const COOLDOWN = 24 * 60 * 60 * 1000;

async function dailycoins(interaction) {
  const sender = interaction.user;
  const userId = sender.id;

  if (!balances.has(userId)) {
    balances.set(userId, STARTING_BALANCE);
  }

  const now = Date.now();
  const lastClaim = dailyct.get(userId);

  if (lastClaim && now - lastClaim < COOLDOWN) {
    const timeLeft = COOLDOWN - (now - lastClaim);

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return interaction.reply({
      content: `you already claimed your daily coinz, come back in **${hours}h ${minutes}m**, k? thx :)`,
      ephemeral: true
    });
  }

  balances.set(userId, balances.get(userId) + DAILY_AMOUNT);
  dailyct.set(userId, now);

  await interaction.reply({
    content: `${sender} got their daily **${DAILY_AMOUNT} coinz**!`
  });
}

module.exports = {
  dailycoins
};