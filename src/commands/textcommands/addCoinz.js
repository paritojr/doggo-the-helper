import { coinz } from "../../database.js";
export default {
  name: "addcoinz",
  description: "gives coinz to a user",
  ownerOnly: true,
  async execute(message, args) {
    const user = message.mentions.users.first();
    const amount = Number(args[1]);

    if (!user) return message.reply("mention someone");
    if (isNaN(amount) || amount <= 0) {
      return message.reply("provide a valid amount pls");
    }

    const current = coinz.get(user.id) || 0;
    coinz.set(user.id, current + amount);
    return message.reply(`gave ${amount} coinz to ${user}`);
  }
};