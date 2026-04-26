function ping(interaction) {
    return interaction.reply({content: `pong! hello ${interaction.user}!`,ephemeral: true});
}
module.exports = { ping }