const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { postboardChannels } = require("../database.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('postboard')
        .setDescription('toggles postboard mode for a channel (auto-threads messages)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('channel to enable or disable postboard mode in')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "you can't use this, my bad :(", ephemeral: true });
        }
        const channel = interaction.options.getChannel("channel");
        if (postboardChannels.has(channel.id)) {
            postboardChannels.delete(channel.id);
            const msgEmbed = new EmbedBuilder()
            .setDescription("This channel is no longer a postboard. Messages sent here will behave normally from now on.")
            .setColor("#fd3c2a")
            await channel.send({
                embeds: [msgEmbed]
            });
            return interaction.reply({ content: `${channel} is no longer a postboard :(`, ephemeral: true });
        }

        postboardChannels.add(channel.id);
        const msgEmbed = new EmbedBuilder()
        .setDescription("This channel is now a postboard. Messages sent here will automatically create threads for discussion.")
        .setColor("#2a62fd")
        await channel.send({
            embeds: [msgEmbed]
        });
        return interaction.reply({ content: `${channel} is now a postboard!`, ephemeral: true });
    }
};