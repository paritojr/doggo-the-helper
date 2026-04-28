const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('userstats')
        .setDescription('shows stats for a specific user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user id hehe')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const user2 = await user.fetch(true);
        const member = await interaction.guild.members.fetch(user.id);
        const avatarUrl = user.displayAvatarURL();
        const accentColor = user2.hexAccentColor || "#3060f1";
        const joinedUnix = Math.floor(member.joinedTimestamp / 1000);
        const joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:d> (<t:${joinedUnix}:R>)`;
        const createdUnix = Math.floor(user.createdTimestamp / 1000);
        const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:d> (<t:${createdUnix}:R>)`;
        const userType = user.bot ? "bot" : "human";
        const isBooster = member.premiumSince ? "yeah!" : "nope";
        const userEmbed = new EmbedBuilder()
            .setTitle(`user stats for ${user.tag}`)
            .setColor(accentColor)
            .setThumbnail(avatarUrl)
            .addFields(
                { name: "joined at", value: joinedAt, inline: true },
                { name: "created at", value: createdAt, inline: true },
                { name: "type", value: `\`${userType}\``, inline: false },
                { name: "avatar", value: `[click here idk](${avatarUrl})`, inline: false },
                { name: "booster?", value: String(isBooster), inline: false },
            )
            .setFooter({ text: "amazing" })
            .setTimestamp();
        await interaction.reply({
            embeds: [userEmbed],
        });
    }
}