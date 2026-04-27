async function ping(interaction) {
    const botLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    return interaction.reply({
        content: `pong! hello ${interaction.user}!\nlatency (bot): ${botLatency}ms\nlatency (API): ${apiLatency}ms`,
        ephemeral: true
    });
}

module.exports = { ping };