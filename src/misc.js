import { client } from "./client.js"
import { postboardChannels, dangerChannels, countingChannels, linkedChannels, dailyMiaChannels, starBoards, activeGiveaways } from "./database.js";
import { timeoutsig } from "./utils/dailycontent.js";
import { giveawayTimeouts } from "./utils/restoreTimeouts.js";

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const isPostboardChannel = postboardChannels.has(message.channel.id);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isDangerChannel = dangerChannels.has(message.channel.id);
    const isCountingChannel = countingChannels.has(message.channel.id);

    if (isDangerChannel) {
        if (isOwner || message.member.permissions.has("Administrator") || message.member.permissions.has("ManageMessages")) return;
        try {
            await message.delete().catch(() => {});
            await message.guild.members.ban(message.author.id, {
                reason: "triggered anti-spam channel"
            });
        } catch (err) {
            console.error("error:", err);
        }
        return;
    }

    if (isCountingChannel) {
        const state = countingChannels.get(message.channel.id);
        if (!state) return;
            
        const raw = message.content.trim();
        const match = raw.match(/^\d+/); 
        if (!match) return;
            
        const num = Number(match[0]);
        const expected = state.current + 1;
        if (message.author.id === state.lastUser || num !== expected) {
            await message.react('❌').catch(()=>{});
            await message.reply(`${message.author} ruined it! game starts back again now`)
            state.highest = Math.max(state.highest ?? 0, state.current);
            state.current = 0;
            state.lastUser = null;
            countingChannels.set(message.channel.id, state);
            return;
        }
            
        state.current = num;
        state.lastUser = message.author.id;
        state.highest = Math.max(state.highest ?? 0, state.current);
        countingChannels.set(message.channel.id, state);
        await message.react('✅').catch(()=>{});
        if (state.goal && state.current >= state.goal) {
            await message.channel.send(`goal reached dudes: ${state.current}`).catch(()=>{});
            state.current = 0;
            state.lastUser = null;
            countingChannels.delete(message.channel.id);
        }
        return;
    }

    for (const [id, link] of linkedChannels.entries()) {
        if (!link?.source || !link?.target) continue;

        const isSource = message.channel.id === link.source;
        const isTarget = message.channel.id === link.target;

        if (!isSource && !isTarget) continue;

        const targetChannelId = isSource ? link.target : link.source;
        const targetChannel = await message.client.channels.fetch(targetChannelId).catch(() => null);
        if (!targetChannel) continue;

        await targetChannel.send({
            content: `**${message.author.username}**: ${message.content || ""}`,
            allowedMentions: { parse: [] }
        }).catch(() => {});
        break;
    }

    if (!isPostboardChannel) return;
    try {
        if (message.hasThread) return;
        const name = `${message.author.username}'s post`;
        await message.startThread({
            name,
            autoArchiveDuration: 1440,
        });
        await message.react("🔥");
    } catch (err) {
        console.error("postboard error:", err);
    }
});

client.on("guildDelete", async (guild) => {
    if (!guild) return;
    const guildChannels = guild.channels.cache;
    for (const [channelId] of guildChannels) {
        if (postboardChannels.has(channelId)) {
            postboardChannels.delete(channelId);
        }
        if (countingChannels.has(channelId)) {
            countingChannels.delete(channelId);
        }
        if (dailyMiaChannels.has(channelId)) {
            dailyMiaChannels.delete(channelId);
            const dailyTimeout = timeoutsig.get(channelId);
            if (dailyTimeout) {
                clearTimeout(dailyTimeout);
                timeoutsig.delete(channelId);
            }
        }
        if (linkedChannels.has(channelId)) {
            linkedChannels.delete(channelId);
        }
    }

    for (const [id, g] of activeGiveaways.entries()) {
        if (g.guildId === guild.id || g.guildID === guild.id) {
            activeGiveaways.delete(id);
            const giveawayTimeout = giveawayTimeouts.get(id);
            if (giveawayTimeout) {
                clearTimeout(giveawayTimeout);
                giveawayTimeouts.delete(id);
            }
        }
    }

    for (const [id, link] of linkedChannels.entries()) {
        if (guildChannels.has(link.source) || guildChannels.has(link.target)) {
            linkedChannels.delete(id);
        }
    }

    if (starBoards.has(guild.id)) {
        starBoards.delete(guild.id);
    }
});
