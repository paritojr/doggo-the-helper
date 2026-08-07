import { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { countingChannels } from '../../database.js';
export default {
   data: new SlashCommandBuilder()
        .setName('countingadmin')
        .setDescription("counting game admin")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setContexts([0])
        .setIntegrationTypes(0)
        .addSubcommand(subcommand =>
           subcommand
            .setName('add')
            .setDescription('add a counting game')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('channel to add counting game')
                .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName('goal')
                .setDescription('set goal for counting game')
            )
         )
        .addSubcommand(subcommand =>
           subcommand
            .setName('remove')
            .setDescription('remove a counting game')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('channel to remove counting game')
                .setRequired(true)
            )
        ),

   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "add") {
        const channel = interaction.options.getChannel('channel');
        const goal = interaction.options.getInteger('goal') || null;

        if (countingChannels.has(channel.id)) {
          return interaction.reply({
            content: 'that channel has already a counting game lol',
            flags: MessageFlags.Ephemeral
          });
        }

        countingChannels.set(channel.id, {
          current: 0,
          goal,
          lastUser: null,
          highest: 0
        });

        return interaction.reply({
          content: `counting game added to ${channel}! the goal is: ${goal || "infinite"}`
        });
      } else if (subcommand === "remove") {
        const channel = interaction.options.getChannel('channel');
        if (!countingChannels.has(channel.id)) {
          return interaction.reply({
            content: 'that channel doesn\'t even have a counting game lol',
            flags: MessageFlags.Ephemeral
          });
        }

        countingChannels.delete(channel.id);
        return interaction.reply({
           content: `removed counting game from ${channel}`
        });
      }
   }
};