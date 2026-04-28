const { EmbedBuilder, time, SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("shows the server stats"),
    
    async execute(interaction) {
        const guild = interaction.guild;
        await guild.channels.fetch();
        const allMembers = await guild.members.fetch();
        const iconUrl = interaction.guild.iconURL({ dynamic: true, size: 256 });
        const memberCount = allMembers.size;
        const creationDate = guild.createdAt;
        const botCount = allMembers.filter((member) => member.user.bot).size;
        const humanCount = allMembers.filter((member) => !member.user.bot).size;
        const channelCount = guild.channels.cache.filter((c) =>(c.type === 0 || c.type === 2 || c.type === 5 || c.type === 13 || c.type === 15) && c.viewable).size;
        const roleCount = guild.roles.cache.size;
        const serverOwner = await guild.fetchOwner();
        const finalMemberCount = `${botCount} bots and ${humanCount} humans (${memberCount} total)`
        const statsEmbed = new EmbedBuilder()
            .setTitle(`server stats for ${guild.name}`)
            .setColor("#3060f1")
            .setThumbnail(iconUrl)
            .addFields(
                { name: "created at", value: time(creationDate, 'F'), inline: false },
                { name: "members", value: String(finalMemberCount), inline: false },
                { name: "channels", value: String(channelCount), inline: true },
                { name: "roles", value: String(roleCount), inline: true },
                { name: "owner", value: `<@${serverOwner.user.id}>`, inline: false },
            )
            .setFooter({ text: "wowsers" })
            .setTimestamp();
        
        await interaction.reply({
            embeds: [statsEmbed],
        });
    }
};