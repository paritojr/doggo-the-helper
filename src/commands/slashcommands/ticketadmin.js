import { SlashCommandBuilder, MessageFlags, ChannelType } from "discord.js";
import { ticketPanels } from "../../database.js";
import { tInitialize, tDestroy } from "../../utils/ticketUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ticketadmin")
    .setDescription("manages ticket panels for your server")
    .setIntegrationTypes([0])
    .setContexts([0])
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("create a new ticket panel")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("name of the panel")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("channel where the panel will be located at")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((option) =>
          option
            .setName("supportrole")
            .setDescription("the role that can view and answer the tickets")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("archive")
            .setDescription("should closed tickets be archived (true) or deleted (false)?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("panel description (if none it will resort to default)")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("delete a ticket panel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("channel where ticket panel was")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "create") {
      const name = interaction.options.getString("name");
      const description = interaction.options.getString("description") || null;
      const channel = interaction.options.getChannel("channel");
      const supportRole = interaction.options.getRole("supportrole");
      const archive = interaction.options.getBoolean("archive");

      ticketPanels.set(channel.id, {
        role: supportRole.id,
        //swa stands for "should we archive?" btw
        swa: archive,
        name: name,
        description: description,
      })

      tInitialize(channel.id);

      return interaction.reply({
        content: `finished! your ticket panel is now in ${channel}`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (subcommand === "delete") {
      const channel = interaction.options.getChannel("channel");
      const doesTheShitExist = ticketPanels.has(channel.id);
      if (doesTheShitExist) {
        await tDestroy(channel.id);
        ticketPanels.delete(channel.id);
        return interaction.reply({
          content: `ticket panel deleted :O`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  },
};