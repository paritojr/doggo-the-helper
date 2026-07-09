import { SlashCommandBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from "discord.js";
import { starBoards } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("starboard bs")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setIntegrationTypes([0])
    .setContexts([0])
    .addSubcommand(subcommand =>
      subcommand
        .setName("setup")
        .setDescription("sets up the starboard")
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
        .setDescription("disables and deletes the starboard entirely")
        .addChannelOption(opt =>
          opt.setName("channel").setDescription("starboard channel")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("see em all")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    let serverStarboards = starBoards.get(guildId) || [];
    if (!Array.isArray(serverStarboards)) {
      serverStarboards = [serverStarboards];
    }

    if (subcommand === "setup") {
      const sbChannel = interaction.options.getChannel("channel");

      const channelExists = serverStarboards.some(sb => sb.starboardChannelId === sbChannel.id);
      if (channelExists) {
        return interaction.editReply({
          content: "there is an starboard, you must use `/starboard disable` before setting up a new one"
        });
      }

      if (serverStarboards.length >= 5) {
        return interaction.editReply({
          content: "maximum limit reached lol"
        });
      }

      const rawEmoji = interaction.options.getString("emoji");
      const rawThreshold = interaction.options.getInteger("threshold");

      const config = {
        starboardChannelId: sbChannel.id,
        emoji: rawEmoji ? rawEmoji.trim() : "⭐",
        threshold: rawThreshold ?? 5,
        posts: {}
      };

      serverStarboards.push(config);
      starBoards.set(guildId, serverStarboards);

      return interaction.editReply({
        content: `starboard updated!\n• channel: ${sbChannel}\n• emoji: ${config.emoji}\n• threshold: **${config.threshold}**`
      });
    } else if (subcommand === "disable") {
      const sbChannel = interaction.options.getChannel("channel");
      const targetIndex = serverStarboards.findIndex(sb => sb.starboardChannelId === sbChannel.id);

      if (targetIndex === -1) {
        return interaction.editReply({
          content: "no starboards here LMAO"
        });
      }
      
      serverStarboards.splice(targetIndex, 1);

      if (serverStarboards.length === 0) {
        starBoards.delete(guildId);
      } else {
        starBoards.set(guildId, serverStarboards);
      }

      return interaction.editReply({
        content: "starboard was disabled and deleted, ty! :)"
      });
    } else if (subcommand === "list") {
      if (serverStarboards.length === 0) {
        return interaction.editReply({
          content: "no starboards here LMAO"
        });
      }

      const listLines = serverStarboards.map((sb, index) => {
        return `**${index + 1}**. <#${sb.starboardChannelId}> | emoji: ${sb.emoji} | threshold: **${sb.threshold}**`;
      });

      return interaction.editReply({
        content: `active starboards (${serverStarboards.length}/5):\n${listLines.join("\n")}`
      });
    }
  },
};
