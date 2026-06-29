import { EmbedBuilder, SlashCommandBuilder, InteractionContextType } from "discord.js";
export default {
    data: new SlashCommandBuilder()
       .setName("serverinfo")
       .setDescription("shows server info")
       .setIntegrationTypes(0)
       .setContexts(InteractionContextType.Guild),
    
    async execute(interaction) {
        const guild = interaction.guild;
        const iconUrl = guild.iconURL({ dynamic: true, size: 256 }) || null;
        const emojiCount = guild.emojis.cache.size;
        const stickerCount = guild.stickers.cache.size;
        const creationDate = guild.createdAt;
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount;
        const channelCount = guild.channels.cache.filter((c) =>(c.type === 0 || c.type === 2 || c.type === 5 || c.type === 13 || c.type === 15) && c.viewable).size;
        const roleCount = guild.roles.cache.size;
        const serverOwner = await guild.fetchOwner();
        const ageDays = Math.floor((Date.now() - guild.createdTimestamp) / 86400000);
        const features = guild.features.length
          ? guild.features.map(f => f
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase())).join(", ")
          : "None";

        const statsEmbed = new EmbedBuilder()
            .setTitle(`server info for ${guild.name}`)
            .setColor("#3060f1")
            .setThumbnail(iconUrl)
            .addFields(
                { name: "created at", value: `<t:${Math.floor(creationDate.getTime() / 1000)}:F>\nthat's like, ${ageDays} days ago!`, inline: false },
                { name: "members", value: String(guild.memberCount), inline: false },
                { name: "channels", value: String(channelCount), inline: true },
                { name: "boosts", value: `level ${boostLevel} (${boostCount} boosts)`, inline: true },
                { name: "emojis", value: `${emojiCount}`, inline: true },
                { name: "stickers", value: `${stickerCount}`, inline: true },
                { name: "roles", value: String(roleCount), inline: true },
                { name: "features", value: features, inline: true },
                { name: "owner", value: `<@${serverOwner.user.id}>`, inline: false },
            )
            .setFooter({ text: "wowsers" })
            .setTimestamp();
        
        await interaction.reply({
            embeds: [statsEmbed],
        });
    }
};