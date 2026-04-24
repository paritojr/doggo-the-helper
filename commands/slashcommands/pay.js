const { coinz } = require("../database.js");

const balances = coinz;
const STARTING_BALANCE = 1000;

async function paycmd(interaction) {
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

module.exports = {
  paycmd
};