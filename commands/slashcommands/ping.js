const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("pings the bot"),

  async execute(interaction) {
    const botLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    return interaction.reply({
        content: `pong! hello ${interaction.user}!\nlatency (bot): ${botLatency}ms\nlatency (API): ${apiLatency}ms`,
        ephemeral: true
    });
  },
};