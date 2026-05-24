import { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { countingChannels } from '../../db.js';
export default {
   data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription("counting game")
        .addSubcommand(subcommand =>
           subcommand
            .setName('help')
            .setDescription('get info about counting game')
         ),

   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "help") {
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