import { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } from "discord.js";
import { linkedChannels } from "../../database.js";

function generateId() {
  //the bullshit of all time
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("link stuff")
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(0)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(subcommand =>
      subcommand.setName("create")
      .setDescription("create link")
    )
    .addSubcommand(subcommand =>
      subcommand.setName("connect")
        .setDescription("connect channel")
        .addStringOption(option =>
          option.setName("id")
          .setDescription("link id")
          .setRequired(true)
        )
        .addChannelOption(option =>
          option.setName("channel")
          .setDescription("channel")
          .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName("remove")
        .setDescription("remove link")
        .addStringOption(option =>
          option.setName("id")
          .setDescription("link id")
          .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "create") {
      const id = generateId();
      linkedChannels.set(id, {
        source: null,
        target: null,
        createdAt: Date.now()
      });

      const neatEmbed = new EmbedBuilder()
        .setTitle("link created")
        .setDescription(`id: \`\`\`\n${id}\n\`\`\``)
        .setColor("Green");
        
      return interaction.reply({
        embeds: [neatEmbed],
        flags: MessageFlags.Ephemeral
      });
    } else if (subcommand === "connect") {
      const id = interaction.options.getString("id");
      const channel = interaction.options.getChannel("channel");
      const link = linkedChannels.get(id);

      if (!link) {
        return interaction.reply({
          content: "invalid id",
          flags: MessageFlags.Ephemeral
        });
      }
      if (!link.source) {
        link.source = channel.id;
      } else if (!link.target) {
        link.target = channel.id;
      } else {
        return interaction.reply({
          content: "already full",
          flags: MessageFlags.Ephemeral
        });
      }

      linkedChannels.set(id, link);
      const neatEmbed = new EmbedBuilder()
        .setTitle("connected")
        .setDescription(`id: \`${id}\`\nchannel: <#${channel.id}>`)
        .setColor("Blue")
    
      return interaction.reply({
        embeds: [neatEmbed],
        flags: MessageFlags.Ephemeral
      });
    } else if (subcommand === "remove") {
      const id = interaction.options.getString("id");
      if (!linkedChannels.has(id)) {
        return interaction.reply({
          content: "link not found, lmao",
          flags: MessageFlags.Ephemeral
        });
      }
      linkedChannels.delete(id);
      const neatEmbed = new EmbedBuilder()
        .setTitle("removed")
        .setDescription(`id: \`${id}\``)
        .setColor("Red")
      return interaction.reply({
        embeds: [neatEmbed],
        flags: MessageFlags.Ephemeral
      });
    }
  }
};