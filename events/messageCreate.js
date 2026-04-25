module.exports = (client, { prefix, textcmds, postboardChannels }) => {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        const isPostboardChannel = postboardChannels.has(message.channel.id);

        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = textcmds[commandName];
            if (!command) return;

            try {
                await command(message, args);
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