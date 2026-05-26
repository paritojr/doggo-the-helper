import { SlashCommandBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { coinz } from "../../db.js";
import { initCoinz } from "../../utils/initcoinz.js";

const balances = coinz;
export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('shows info for a specific user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user id hehe')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const createdUnix = Math.floor(user.createdTimestamp / 1000);
        const userType = user.bot ? "bot" : "human";

        initCoinz(user.id);
        const userBalance = balances.get(user.id);
        let displayName = user.globalName || user.username;
        let avatarUrl = user.displayAvatarURL({ size: 256 });
        let extraInfo = "";
        let extraInfo2 = "";

        if (interaction.inGuild()) {
            try {
                const member = await interaction.guild.members.fetch(user.id);
                const joinedUnix = Math.floor(member.joinedTimestamp / 1000);
                const isBooster = member.premiumSince ? "yes!" : "no :(";
                displayName = member.displayName;
                avatarUrl = member.displayAvatarURL({ size: 256 });
                extraInfo = `joined server at: <t:${joinedUnix}:d> (<t:${joinedUnix}:R>)\n`;
                extraInfo2 = `\nbooster: ${isBooster}`;
            } catch (err) {
                console.log("my bad")
            }
        }

        let detailsContent = `created at: <t:${createdUnix}:d> (<t:${createdUnix}:R>)\n${extraInfo}\n` +
                             `balance: ${userBalance} coinz\n` +
                             `type: \`${userType}\`${extraInfo2}`;

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 9,
                            components: [
                                {
                                    type: 10,
                                    content:
                                        `# ${displayName}\n` +
                                        `<@${user.id}> (${user.username})\n`
                                }
                            ],
                            accessory: {
                                type: 11,
                                media: {
                                    url: avatarUrl
                                }
                            }
                        },
                        {
                            type: 10,
                            content: detailsContent
                        },
                        { type: 14 },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: ButtonStyle.Link,
                                    label: "Avatar",
                                    url: avatarUrl
                                }
                            ],
                        }
                    ]
                }
            ]
        });
    }
};