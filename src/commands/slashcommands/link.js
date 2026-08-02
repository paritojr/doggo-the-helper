import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { linkedChannels } from "../../database.js";

function generateId() {
  //the bullshit of all time
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("link stuff")
    .setContexts([0])
    .setIntegrationTypes([0])
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
    )
    .addSubcommand(subcommand =>
      subcommand.setName("unlink")
        .setDescription("unlink this channel")
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

      if ((link.source && link.source.id === channel.id) || (link.target && link.target.id === channel.id)) {
        return interaction.reply({
          content: "dear...",
          flags: MessageFlags.Ephemeral
        });
      }

      if (link.source && link.target) {
        return interaction.reply({
          content: "already full",
          flags: MessageFlags.Ephemeral
        });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {
        const webhook = await channel.createWebhook({
          name: "doggo the link",
          reason: `doggo link id: ${id}, made by ${interaction.user.tag} :)`
        });

        const connectionData = {
          id: channel.id,
          url: webhook.url
        };

        if (!link.source) {
          link.source = connectionData;
        } else {
          link.target = connectionData;
        }

        linkedChannels.set(id, link);
        const neatEmbed = new EmbedBuilder()
          .setTitle("connected")
          .setDescription(`id: \`${id}\`\nchannel: <#${channel.id}>`)
          .setColor("Blue")
    
        return interaction.editReply({ embeds: [neatEmbed] });
      } catch (error) {
        console.error(error);
        return interaction.editReply({
          //why am i doing this
          content: "please make sure you have actually given me permissions to make the webhook gng :pray:"
        });
      }
    } else if (subcommand === "remove") {
      const id = interaction.options.getString("id");
      const link = linkedChannels.get(id);
      if (!link) {
        return interaction.reply({
          content: "link not found LMAOOOOO",
          flags: MessageFlags.Ephemeral
        });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      for (const side of ["source", "target"]) {
        if (link[side]?.url) {
          try {
            const parts = link[side].url.split("/");
            const client = await interaction.client.fetchWebhook(parts.at(-2), parts.at(-1));
            await client.delete("link removed mfs!!!!");
          } catch (e) {}
        }
      }

      linkedChannels.delete(id);
      const neatEmbed = new EmbedBuilder()
        .setTitle("removed")
        .setDescription(`id: \`${id}\``)
        .setColor("Red")

      return interaction.editReply({ embeds: [neatEmbed] });

    } else if (subcommand === "unlink") {
      const channel = interaction.channel;
      if (!channel) {
        return interaction.reply({
          content: "no channel found",
          flags: MessageFlags.Ephemeral
        });
      }
      
      const entry = [...linkedChannels.entries()].find(([id, link]) =>
        (link.source && link.source.id === channel.id) || (link.target && link.target.id === channel.id)
      );
      
      if (!entry) {
        return interaction.reply({
          content: "this channel is not linked lmao",
          flags: MessageFlags.Ephemeral
        });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const [id, link] = entry;
      const side = (link.source?.id === channel.id) ? "source" : (link.target?.id === channel.id) ? "target" : null;
      if (side) {
        if (link[side].url) {
          try {
            const parts = link[side].url.split("/");
            const client = await interaction.client.fetchWebhook(parts.at(-2), parts.at(-1));
            await client.delete("Channel unlinked");
          } catch (e) {}
        }
        link[side] = null;
      }
      
      if (!link.source && !link.target) {
        linkedChannels.delete(id);
      } else {
        linkedChannels.set(id, link);
      }
      await channel.send("**This channel has been unlinked.**");
      return interaction.editReply({
        content: `unlinked <#${channel.id}> from \`${id}\``
      });
    }
  }
};