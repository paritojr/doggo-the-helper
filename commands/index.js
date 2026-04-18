const slashcmds = {
  giveaway: require("./giveaway.js").giveaway,
  stats: require("./stats.js").stats,
  userstats: require("./userstats.js").userstats,
  embed: require("./embed.js").embedcommand,
  "8ball": require("./8ball.js").eightball,
  flip: require("./coinflip.js").flip,
  random: require("./random.js").randompet,
  qrcode: require("./qrcode.js").qrcodebruh,
};

module.exports = slashcmds;