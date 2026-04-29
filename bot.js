import "dotenv/config";
const prefix = "!";
import { Client, GatewayIntentBits, REST, ActivityType } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { slashcmds, textcmds } from "./commands/index.js";
import { postboardChannels, activeGiveaways } from "./commands/database.js";
import { updater } from "./utils/updater.js";
import { stopGiveaway } from "./utils/stopGiveaway.js";
import messageCreate from "./events/messageCreate.js";
import interactionCreate from "./events/interactionCreate.js";

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
messageCreate(client, { prefix, textcmds, postboardChannels });
interactionCreate(client, { slashcmds });
client.once("clientReady", async () => {
    console.log(`bot is online! logged in as ${client.user.tag}`);
    console.log(`bot is serving ${client.guilds.cache.size} guilds`);
    client.user.setActivity("normal", {
        type: ActivityType.Custom,
        state: "relaxing as a doggo :)",
    });
    const cmdsarray = Object.values(slashcmds).map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
    let currentIndex = 0;
    //customize this as you want! not only does it have to be 10 seconds, you know ;)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % statuses.length;
        const { name, type, state } = statuses[currentIndex];
        if (type === ActivityType.Custom) {
            client.user.setActivity(name, { type: type, state: state });
        } else {
            client.user.setActivity(name, { type: type });
        }
    }, 10000);
    for (const [id, g] of activeGiveaways) {
        const timeLeft = g.endTime - Date.now();
        setTimeout(
            () => stopGiveaway(client, id),
            timeLeft > 0 ? timeLeft : 0
        );
    }
    try {
        console.log("started refreshing application (/) commands...");
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: cmdsarray,
        });
        console.log("successfully reloaded application (/) commands!");
    } catch (error) {
        console.error("error registering slash commands:", error);
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
updater();
setInterval(() => { updater() }, 10 * 60 * 1000);