require('dotenv').config();
const { Client, GatewayIntentBits, REST, EmbedBuilder, ActivityType, time, SlashCommandStringOption } = require("discord.js");
const { AutoModerationRuleTriggerType, Routes } = require('discord-api-types/v10');
const commands = require("./commands/list.json");
const slashcmds = require("./commands/index.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});
client.activeGiveaways = new Map();

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
    if (commandName === "hello") {
        await interaction.reply({ content: "hello there!", ephemeral: true });
    } else if (commandName === "ping") {
        await interaction.reply({ content: `pong! hello ${interaction.user}!`, ephemeral: true });
    } else if (commandName === "giveaway") {
        slashcmds.giveaway(interaction, client);
    } else if (commandName === "stats") {
        slashcmds.stats(interaction);
    } else if (commandName === "userstats") {
        slashcmds.userstats(interaction);
    } else if (commandName === "embed") {
        slashcmds.embedcommand(interaction);
    } else if (commandName === "8ball") {
        slashcmds.eightball(interaction);
    } else if (commandName === "flip") {
        slashcmds.flip(interaction);
    } else if (commandName === "random") {
        slashcmds.randompet(interaction);
    } else if (commandName === "qrcode") {
        slashcmds.qrcode(interaction);
    }
});
client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const isFlagged = isContentFlagged(guild, member.user.tag);
    if (isFlagged === true) {
        try {
            await member.ban({ reason: "not following rules" });
        } catch (error) {
            console.error(`failed to ban ${member.user.tag}:`, error);
        }
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
