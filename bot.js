const { Client, GatewayIntentBits, REST, EmbedBuilder, ActivityType } = require("discord.js");
const { AutoModerationRuleTriggerType, Routes } = require('discord-api-types/v10');
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
function parseTime(timeString) {
    const timeRegex = /^(\d+)([dhm])$/;
    const match = timeString.match(timeRegex);
    if (!match) return null;
    const amount = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case "d":
            return amount * 24 * 60 * 60 * 1000;
        case "h":
            return amount * 60 * 60 * 1000;
        case "m":
            return amount * 60 * 1000;
        default:
            return null;
    }
}
//idk why i didn't use dotenv, oh well ¯\_(ツ)_/¯
const BOT_TOKEN = "YOUR_BOT_TOKEN";
//rotating statuses are more fun than a static one
const statuses = [
    { name: "doggo the doggo", type: ActivityType.Playing },
    { name: "normal", type: ActivityType.Custom, state: "relaxing as a doggo :)",},
    { name: "wow", type: ActivityType.Custom, state: "life is awesome!" },
    { name: "lofi music", type: ActivityType.Listening },
    { name: "nice", type: ActivityType.Custom, state: "today's a great day!!!" }
];
const commands = [
    {
        name: "hello",
        description: "says hello to you",
    },
    {
        name: "ping",
        description: "pings the bot",
    },
    {
        name: "giveaway",
        description: "creates or manages giveaways",
        options: [
            {
                name: "prize",
                description: "the giveaway prize :O",
                type: 3,
                required: false,
            },
            {
                name: "time",
                description: "the duration of the giveaway",
                type: 3,
                required: false,
            },
            {
                name: "stop",
                description: "stops da giveaway based on id",
                type: 3,
                required: false,
            },
        ],
    },
    {
        name: "stats",
        description: "shows the server stats",
    },
    {
        name: "userstats",
        description: "shows stats for a specific user",
        options: [
            {
                name: "user",
                description: "user id hehe",
                type: 6,
                required: false,
            },
        ]
    },
    {
        name: "embed",
        description: "creates a fantastic embed",
        options: [
            {
                name: "title",
                description: "the embed's title :O",
                type: 3,
                required: true
            },
            {
                name: "description",
                description: "the description of the embed",
                type: 3,
                required: true
            },
            {
                name: "color",
                description: "color for the embed (send in hexadecimal, like this: #2a62fd)",
                type: 3,
                required: true
            },
            {
                name: "footer",
                description: "the footer of the embed",
                type: 3,
                required: false
            },
            {
                name: "timestamp",
                description: "choose whether add a timestamp or not to the embed",
                type: 5,
                required: false
            }
        ],
    }
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
//this function is IMPORTANT, as it makes your bot follow discord's AutoMod rules
//tbh it depends on the server
async function isContentFlagged(guild, content) {
    try {
        const rules = await guild.autoModerationRules.fetch();
        const text = String(content || '').toLowerCase();
        console.log('doggo is analyzing this text:', text);
        for (const rule of rules.values()) {
            if ( rule.triggerType === AutoModerationRuleTriggerType.Keyword || rule.triggerType === AutoModerationRuleTriggerType.MemberProfile ) {
                const keywords = rule.triggerMetadata.keywordFilter;
                if (keywords && keywords.length > 0) {
                    const isKeywordFlagged = keywords.some(rawKeyword => {
                        const cleanKeyword = rawKeyword.replace(/\*/g, '').toLowerCase();
                        return text.includes(cleanKeyword);
                    });
                    if (isKeywordFlagged) {
                        console.log("its flagged, my bad");
                        return true;
                    }
                }
            } else if (rule.triggerType === AutoModerationRuleTriggerType.KeywordPreset) {
                //i didnt really know what to even do here, so i just put this
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error('an error happened, here:', error);
    }
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    if (commandName === "hello") {
        await interaction.reply({ content: "hello there!", ephemeral: true });
    } else if (commandName === "ping") {
        await interaction.reply({ content: `pong! hello ${interaction.user}!`, ephemeral: true });
    } else if (commandName === "giveaway") {
        const prize = interaction.options.getString("prize");
        const time = interaction.options.getString("time");
        const stopOption = interaction.options.getString("stop");
        if (stopOption) {
            const giveawayId = stopOption;
            const giveaway = client.activeGiveaways.get(giveawayId);
            if (!giveaway) {
                await interaction.reply({
                    content: "giveaway not found (my bad)",
                    ephemeral: true,
                });
                return;
            }
            try {
                const channel = await client.channels.fetch(giveaway.channelId);
                const message = await channel.messages.fetch(
                    giveaway.messageId,
                );
                const reaction = message.reactions.cache.get("🎉");
                if (!reaction) {
                    await interaction.reply({
                        content: "there are no participants :(",
                        ephemeral: true,
                    });
                    return;
                }

                const users = await reaction.users.fetch();
                const participants = users.filter((user) => !user.bot);

                if (participants.size === 0) {
                    await interaction.reply("there are no participants...");
                    return;
                }
                const participantArray = Array.from(participants.values());
                const winners = [];
                for (let i = 0; i < Math.min(giveaway.winners, participantArray.length); i++) {
                    const randomIndex = Math.floor(Math.random() * participantArray.length);
                    winners.push(participantArray.splice(randomIndex, 1)[0]);
                }
                const winnerList = winners
                    .map((winner) => `<@${winner.id}>`)
                    .join(", ");
                const winnerEmbed = new EmbedBuilder()
                    .setTitle("🎉 GIVEAWAY ENDED! 🎉")
                    .setDescription(
                        `**Prize:** ${giveaway.prize}\n**Winner${winners.length > 1 ? "s" : ""}:** ${winnerList}\n\ncongratulations! you won the giveaway!`,
                    )
                    .setColor("#00FF00")
                    .setTimestamp();

                await interaction.reply({ embeds: [winnerEmbed] });
                client.activeGiveaways.delete(giveawayId);
            } catch (error) {
                console.error("error ending giveaway:", error);
                await interaction.reply({
                    content: "error ending giveaway!",
                    ephemeral: true,
                });
            }
        } else {
            if (!prize || !time) {
                await interaction.reply({
                    content: "pls provide both prize and time for creating a giveaway",
                    ephemeral: true,
                });
                return;
            }
            const duration = parseTime(time);
            if (!duration) {
                await interaction.reply({
                    content: "invalid time format, use format like: 1d, 5h, 30m",
                    ephemeral: true,
                });
                return;
            }
            const isFlagged = await isContentFlagged(interaction.guild, prize);
            if (isFlagged == true) {
              await interaction.reply({ 
                content: 'nuhuh, cant say that', 
                ephemeral: true 
              });
              console.log("flagged");
              return;
            }
            const giveawayId = Date.now().toString();
            const endTime = Date.now() + duration;
            const giveawayEmbed = new EmbedBuilder()
                .setTitle(`${prize} giveaway!`)
                .setDescription(`react with 🎉 to enter!`)
                .addFields(
                    { name: "duration", value: time, inline: true },
                    { name: "winners", value: "1", inline: true },
                )
                .setColor("#3060f1")
                .setFooter({ text: "good luck to everyone!" })
                .setTimestamp();

            const giveawayMessage = await interaction.reply({
                content: "its giveaway time!!!! 🐾🎉",
                embeds: [giveawayEmbed],
                fetchReply: true,
            });
            await interaction.followUp({
                content: `this is the giveaway id: ${giveawayId}, whenever you want to manually stop the giveaway, use this id`,
                ephemeral: true,
            });
            client.activeGiveaways.set(giveawayId, {
                messageId: giveawayMessage.id,
                channelId: interaction.channelId,
                guildId: interaction.guildId,
                prize: prize,
                winners: 1,
                endTime: endTime,
                hostId: interaction.user.id,
            });
        }
    } else if (commandName === "stats") {
        const guild = interaction.guild;
        await guild.channels.fetch();
        const allMembers = await guild.members.fetch();
        const memberCount = allMembers.size;
        const botCount = allMembers.filter((member) => member.user.bot).size;
        const humanCount = allMembers.filter((member) => !member.user.bot).size;
        const channelCount = guild.channels.cache.filter((c) =>(c.type === 0 || c.type === 2 || c.type === 5 || c.type === 15) && c.viewable).size;
        const roleCount = guild.roles.cache.size;
        const serverOwner = await guild.fetchOwner();
        const statsEmbed = new EmbedBuilder()
            .setTitle(`server stats for ${guild.name}`)
            .setColor("#3060f1")
            .addFields(
                { name: "members", value: String(memberCount), inline: true },
                { name: "bots", value: String(botCount), inline: true },
                { name: "humans", value: String(humanCount), inline: true },
                { name: "channels", value: String(channelCount), inline: true },
                { name: "roles", value: String(roleCount), inline: true },
                { name: "owner", value: `<@${serverOwner.user.id}>`, inline: true },
            )
            .setFooter({ text: "wowsers" })
            .setTimestamp();

        await interaction.reply({
            embeds: [statsEmbed],
        });
    } else if (commandName === "userstats") {
        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const joinedAt = member.joinedAt.toLocaleString(undefined, { dateStyle: 'short' });
        const createdAt = user.createdAt.toLocaleString(undefined, { dateStyle: 'short' });
        const userEmbed = new EmbedBuilder()
            .setTitle(`user stats for ${user.tag}`)
            .setColor("#3060f1")
            .addFields(
                { name: "joined at", value: String(joinedAt), inline: true },
                { name: "created at", value: String(createdAt), inline: true },
            )
            .setFooter({ text: "amazing" })
            .setTimestamp();
        await interaction.reply({
            embeds: [userEmbed],
        });
    } else if (commandName === "embed") {
        const title = interaction.options.getString("title");
        const description = interaction.options.getString("description");
        const color = interaction.options.getString("color");
        const footer = interaction.options.getString("footer") || null;
        const timestamp = interaction.options.getBoolean("timestamp") || false;
        const isTheColorValid = /^#[0-9A-Fa-f]{6}$/.test(color);
        if (!isTheColorValid) {
            await interaction.reply({
                content: "whoops! color property is invalid, pls try again",
                ephemeral: true
            });
            return;
        }
        const awesomeEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description.replace(/\\n/g, '\n'))
            .setColor(color)
        if (timestamp == true) {
            awesomeEmbed.setTimestamp(Date.now());
        }
        if (footer != null) {
            awesomeEmbed.setFooter({ text: footer });
        }
        const isFlagged = await isContentFlagged(interaction.guild, title || description || footer);
        if (isFlagged == true) {
          await interaction.reply({ 
            content: 'nuhuh, cant say that', 
            ephemeral: true 
          });
          console.log("flagged");
          return;
        } else {
            await interaction.reply({
                content: `${interaction.user} says:`,
                embeds: [awesomeEmbed],
            });
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
