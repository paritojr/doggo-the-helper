require('dotenv').config();
const prefix = "!";
const { Client, GatewayIntentBits, REST, ActivityType } = require("discord.js");
const { Routes } = require('discord-api-types/v10');
const { slashcmds, textcmds, commands } = require("./commands/index.js");
const { postboardChannels } = require("./commands/database.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});
const BOT_TOKEN = process.env.TOKEN;
//rotating statuses are more fun than a static one
const statuses = [
    { name: "doggo the doggo", type: ActivityType.Playing },
    { name: "normal", type: ActivityType.Custom, state: "relaxing as a doggo :)",},
    { name: "wow", type: ActivityType.Custom, state: "life is awesome!" },
    { name: "lofi music", type: ActivityType.Listening },
    { name: "nice", type: ActivityType.Custom, state: "today's a great day!!!" }
];
client.once("clientReady", async () => {
    console.log(`bot is online! logged in as ${client.user.tag}`);
    console.log(`bot is serving ${client.guilds.cache.size} guilds`);
    client.user.setActivity("normal", {
        type: ActivityType.Custom,
        state: "relaxing as a doggo :)",
    });
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
    let currentIndex = 0;
    //customize this as you want! not only does it have to be 30 seconds, you know ;)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % statuses.length;
        const { name, type, state } = statuses[currentIndex];
        if (type === ActivityType.Custom) {
            client.user.setActivity(name, { type: type, state: state });
        } else {
            client.user.setActivity(name, { type: type });
        }
    }, 30000);
    try {
        console.log("started refreshing application (/) commands...");
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });
        console.log("successfully reloaded application (/) commands!");
    } catch (error) {
        console.error("error registering slash commands:", error);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    try {
        if (commandName === "hello") {
            return interaction.reply({content: "hello there!", ephemeral: true});
        }
        if (commandName === "ping") {
            return interaction.reply({content: `pong! hello ${interaction.user}!`, ephemeral: true});
        }
        const cmd = slashcmds[commandName];
        if (!cmd) {
            return interaction.reply({
                content: "Unknown command.",
                ephemeral: true
            });
        }
        await cmd(interaction, client);
    } catch (err) {
        console.error(err);
    }
});
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const isPostboardChannel = postboardChannels.has(message.channel.id);
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = textcmds[commandName];
        if (!command) return;
        try {
            return await command(message, args);
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
    } catch (err) {
        console.error("postboard error:", err);
    }
});
client.on("reconnecting", () => {
    console.log("bot is reconnecting...");
});
client.on("disconnect", () => {
    console.log("bot disconnected");
});
client.on("error", (error) => {
    console.error("oopsie, there's an error here:", error);
});
process.on("SIGINT", () => {
    client.destroy();
    process.exit(0);
});
process.on("SIGTERM", () => {
    client.destroy();
    process.exit(0);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("unhandled rejection at:", promise, "reason:", reason);
});
console.log("starting da bot...");
client.login(BOT_TOKEN)
    .then(() => {
        console.log("bot login successful!");
    })
    .catch((error) => {
        console.error("failed to login to Discord:", error);
        console.error("token invalid, my bad");
        process.exit(1);
    });
module.exports = client;
