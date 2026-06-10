import { textcmds } from "../cmds.js";
import config from "../../config.json" with { type: "json" };
import { client } from "../client.js"
import { postboardChannels, dangerChannels, countingChannels } from "../database.js";

const prefix = config.prefix;
const cooldowns = new Map();
const cooldownTime = 1000;

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

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

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = textcmds[commandName];
        if (!command) return;
        if (command.ownerOnly && !isOwner) return;

        const now = Date.now();
        const expirationTime = cooldowns.get("global") || 0;
        if (now < expirationTime) return;
        cooldowns.set("global", now + cooldownTime);
            
        try {
            await command.execute(message, args);
        } catch (err) {
            console.error("textcmd error:", err);
        }
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