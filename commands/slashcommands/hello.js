function hello(interaction) {
    return interaction.reply({content: "hello there!", ephemeral: true});
}
module.exports = { hello }