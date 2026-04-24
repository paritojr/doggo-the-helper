const slashcmds = {
  giveaway: require("./slashcommands/giveaway.js").giveaway,
  stats: require("./slashcommands/stats.js").stats,
  userstats: require("./slashcommands/userstats.js").userstats,
  embed: require("./slashcommands/embed.js").embedcommand,
  "8ball": require("./slashcommands/8ball.js").eightball,
  flip: require("./slashcommands/coinflip.js").flip,
  random: require("./slashcommands/random.js").randompet,
  qrcode: require("./slashcommands/qrcode.js").qrcodebruh,
  postboard: require("./slashcommands/postboard.js").postboard,
  slots: require("./slashcommands/slots.js").slots,
  balance: require("./slashcommands/balance.js").balance,
};
const textcmds = {
  kick: require("./textcommands/kick.js").kickmember,
  ban: require("./textcommands/ban.js").banuser,
};
const commands = require("./slashcommands/list.json");
module.exports = {
  slashcmds, textcmds, commands
}