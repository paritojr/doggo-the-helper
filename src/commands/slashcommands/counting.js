import { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { countingChannels } from '../../db.js';
export default {
   data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription("counting game")
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
                .setRequired(true)
            )
         )
        .addSubcommand(subcommand =>
           subcommand
            .setName('remove')
            .setDescription('remove counting game channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('channel to remove counting game')
                .setRequired(true)
            )
         )
        .addSubcommand(subcommand =>
           subcommand
            .setName('info')
            .setDescription('get info about counting game')
         ),

   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "add") {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
              content: 'you need permissions to use this lol',
              flags: MessageFlags.Ephemeral
            });
        }
        const channel = interaction.options.getChannel('channel');
        const goal = interaction.options.getInteger('goal');

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
            content: `counting game added to ${channel}! the goal is: ${goal}`
        });
      } else if (subcommand === "remove") {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
              content: 'you need permissions to use this lol',
              flags: MessageFlags.Ephemeral
            });
        }
        
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
      } else if (subcommand === "info") {
        const infolol = `the counting game is a game where everyone takes turns to count sequentially one by one

        **rules:**
        \\- a person can't count twice
        \\- non numeric inputs are ignored

        if you get a correct number the bot reacts with "✅", otherwise it will react with "❌" and the game will restart
        if the channel gets to the goal the game ends

        that's it, have fun! :)
        
        `
        const funnyembed = new EmbedBuilder()
            .setTitle("counting game info")
            .setDescription(`${infolol}`)
            .setColor("#3060f1");

        await interaction.reply({
            embeds: [funnyembed],
        });
      }
   }
};