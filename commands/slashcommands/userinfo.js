import { SlashCommandBuilder, ButtonStyle, MessageFlags } from "discord.js";
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
                                    url: user.displayAvatarURL({ size: 256 })
                                }
                            }
                        },
                        { type: 14 },
                        {
                            type: 9,
                            components: [
                                {
                                    type: 10,
                                    content:
                                        `created at: <t:${createdUnix}:d> (<t:${createdUnix}:R>)\n` +
                                        `joined server at: <t:${joinedUnix}:d> (<t:${joinedUnix}:R>)\n\n` +
                                        `type: \`${userType}\`\n` +
                                        `booster?: ${isBooster}`
                                }
                            ],
                            accessory: {
                                type: 2,
                                style: ButtonStyle.Link,
                                label: "Avatar",
                                url: user.displayAvatarURL({ size: 1024 })
                            }
                        }
                    ]
                }
            ]
        });
    }
};