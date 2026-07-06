import { SlashCommandBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from "discord.js";
import { starBoards } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("admin configuration for the starboard system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setIntegrationTypes([0])
    .setContexts([0])
    .addSubcommand(subcommand =>
      subcommand
        .setName("setup")
        .setDescription("configures the channel, emoji, and threshold for the starboard")
        .addChannelOption(opt => 
          opt.setName("channel").setDescription("channel for starboard")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true))
        .addStringOption(opt =>
          opt.setName("emoji")
          .setDescription("the emoji to use (default: ⭐)")
          .setRequired(false))
        .addIntegerOption(opt => 
          opt.setName("threshold").setDescription("minimum reactions required (default: 5)")
          .setMinValue(1)
          .setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("disable")
        .setDescription("completely disables the starboard and wipes its settings")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const hasStarboard = starBoards.has(guildId);

    if (subcommand === "setup") {
      if (hasStarboard) {
        return interaction.editReply({
          content: "there is an starboard, you must use `/starboard disable` before setting up a new one"
        });
      }

      const sbChannel = interaction.options.getChannel("channel");
      const rawEmoji = interaction.options.getString("emoji");
      const rawThreshold = interaction.options.getInteger("threshold");

      const config = {
        starboardChannelId: sbChannel.id,
        emoji: rawEmoji ? rawEmoji.trim() : "⭐",
        threshold: rawThreshold ?? 5,
        posts: {}
      };

      starBoards.set(guildId, config);

      return interaction.editReply({
        content: `starboard updated!\n• channel: ${sbChannel}\n• emoji: ${config.emoji}\n• threshold: **${config.threshold}**`
      });
    }

    if (subcommand === "disable") {
      if (!hasStarboard) {
        return interaction.editReply({
          content: "no starboards here LMAO"
        });
      }
      starBoards.delete(guildId);
      return interaction.editReply({
        content: "starboard has been completely removed and disabled for this server :)"
      });
    }
  },
};
