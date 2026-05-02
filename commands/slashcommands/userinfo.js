import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('shows info for a specific user')
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
        const isBooster = member.premiumSince ? "yes!" : "no :(";

        const userEmbed = new EmbedBuilder()
            .setTitle(`user info for ${user.tag}`)
            .setColor(accentColor)
            .setThumbnail(avatarUrl)
            .addFields(
                { name: "joined server at", value: joinedAt, inline: true },
                { name: "created at", value: createdAt, inline: true },
                { name: "type", value: `\`${userType}\``, inline: false },
                { name: "booster?", value: String(isBooster), inline: false },
            )
            .setFooter({ text: "amazing" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Avatar")
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ size: 1024 })),

            new ButtonBuilder()
                .setLabel("Profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/users/${user.id}`)
        );

        await interaction.reply({
            embeds: [userEmbed],
            components: [row],
        });
    }
}