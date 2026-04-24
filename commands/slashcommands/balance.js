const { coinz } = require("../database.js");

const balances = coinz;
const STARTING_BALANCE = 1000;

async function balance(interaction) {
  const target = interaction.options.getUser("user") || interaction.user;
  const userId = target.id;
  if (!balances.has(userId)) {
    balances.set(userId, STARTING_BALANCE);
  }
  const userBalance = balances.get(userId);
  await interaction.reply({
    content: `${target} has **${userBalance} coinz**`
  });
}

module.exports = {
    balance
};