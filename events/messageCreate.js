import "dotenv/config";
export default (client, { prefix, ownerprefix, textcmds, postboardChannels }) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        const isPostboardChannel = postboardChannels.has(message.channel.id);
        const isOwner = message.author.id === process.env.OWNER_ID;
        if (message.content.startsWith(ownerprefix)) {
            if (!isOwner) return;
            const args = message.content.slice(ownerprefix.length)
            .trim()
            .split(/ +/);
            const commandName = args.shift()?.toLowerCase();
            const command = textcmds[commandName];
            if (!command) return;
            if (!command.ownerOnly) return;

            try {
                await command.execute(message, args);
            } catch (err) {
                console.error("owner cmd error:", err);
            }
            return;
        }

        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = textcmds[commandName];
            if (!command) return;
            if (command.ownerOnly) return;
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