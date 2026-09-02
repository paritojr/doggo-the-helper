import { SlashCommandBuilder, MessageFlags, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from "discord.js";
import { ticketPanels } from "../../database.js";
import { tInitialize, tDestroy, tModify } from "../../utils/ticketUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ticketadmin")
    .setDescription("manages ticket panels for your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
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
        .setName("modify")
        .setDescription("modify a ticket panel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("channel where ticket panel is going to be modified")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
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
    } else if (subcommand === "modify") {
      const channel = interaction.options.getChannel("channel");
      const panelData = ticketPanels.get(channel.id);

      if (!panelData) {
        return interaction.reply({
          content: ":sob:",
          flags: MessageFlags.Ephemeral
        });
      }
      const thoseFields = [
        { id: 'name', label: 'name', style: TextInputStyle.Short, required: true, value: panelData.name },
        { id: 'description', label: 'description', style: TextInputStyle.Paragraph, required: true, value: panelData.description || "" },
        { id: 'role', label: 'input a role id (only 1)', style: TextInputStyle.Short, required: true, value: panelData.role },
        { id: 'archive', label: 'archive?', style: TextInputStyle.Short, required: true, value: String(panelData.swa) }
      ];
      const customId = `embed-modal-${interaction.id}`;
      const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle('embed maker')
        .addComponents(
          thoseFields.map(({ id, label, style, required, value }) => {
            const input = new TextInputBuilder()
              .setCustomId(id)
              .setLabel(label)
              .setStyle(style)
              .setRequired(required);
            if (value) input.setValue(value);
            return new ActionRowBuilder().addComponents(input);
          })
       );

      await interaction.showModal(modal);
      try {
        const submitted = await interaction.awaitModalSubmit({
          time: 300_000,
          filter: i => i.customId === customId && i.user.id === interaction.user.id,
        });
        const { fields } = submitted;
        const name = fields.getTextInputValue('name');
        const description = fields.getTextInputValue('description');
        const role = fields.getTextInputValue('role').replace(/[<@&>]/g, '').trim();
        const roleExists = interaction.guild.roles.cache.has(role);
        if (!roleExists) {
          return submitted.reply({
            content: 'pls input valid role ids',
            flags: MessageFlags.Ephemeral
          });
        }
        const archiveInput = fields.getTextInputValue('archive').toLowerCase().trim();
        const archive = archiveInput === 'true' || archiveInput === 'yes';

        ticketPanels.set(channel.id, {
          role: role,
          swa: archive,
          name: name,
          description: description,
          messageId: panelData.messageId
        })
        await tModify(channel.id);
        return submitted.reply({
          content: 'done!',
          flags: MessageFlags.Ephemeral
        });
      } catch (error) {
         console.log("YOU'RE TAKING TOO LONG");
      }
    } else if (subcommand === "delete") {
      const channel = interaction.options.getChannel("channel");
      const doesTheShitExist = ticketPanels.has(channel.id);
      if (doesTheShitExist) {
        await tDestroy(channel.id);
        ticketPanels.delete(channel.id);
        return interaction.reply({
          content: `ticket panel deleted :O`,
          flags: MessageFlags.Ephemeral
        });
      } else {
        return interaction.reply({
          content: `uhhhhhhhhh`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  },
};