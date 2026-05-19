import "dotenv/config";
import { postboardChannels, dangerChannels } from "../commands/database.js";
export default (client, { prefix, textcmds }) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        const isPostboardChannel = postboardChannels.has(message.channel.id);
        const isOwner = message.author.id === process.env.OWNER_ID;
        const isDangerChannel = dangerChannels.has(message.channel.id);

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

        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = textcmds[commandName];
            if (!command) return;
            if (command.ownerOnly && !isOwner) return;
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
};