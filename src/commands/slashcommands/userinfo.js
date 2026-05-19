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
        const member = await interaction.guild.members.fetch(user.id);

        const joinedUnix = Math.floor(member.joinedTimestamp / 1000);
        const createdUnix = Math.floor(user.createdTimestamp / 1000);

        const userType = user.bot ? "bot" : "human";
        const isBooster = member.premiumSince ? "yes!" : "no :(";

        initCoinz(user.id);
        const userBalance = balances.get(user.id);

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
                                        `# ${member.displayName}\n` +
                                        `<@${user.id}> (${user.username})\n`
                                }
                            ],
                            accessory: {
                                type: 11,
                                media: {
                                    url: member.displayAvatarURL({ size: 256 })
                                }
                            }
                        },
                        {
                            type: 10,
                            content:
                                `created at: <t:${createdUnix}:d> (<t:${createdUnix}:R>)\n` +
                                `joined server at: <t:${joinedUnix}:d> (<t:${joinedUnix}:R>)\n\n` +
                                `balance: ${userBalance} coinz\n` +
                                `type: \`${userType}\`\n` +
                                `booster?: ${isBooster}`
                        },
                        { type: 14 },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: ButtonStyle.Link,
                                    label: "Avatar",
                                    url: member.displayAvatarURL({ size: 1024 })
                                }
                            ],
                        }
                    ]
                }
            ]
        });
    }
};