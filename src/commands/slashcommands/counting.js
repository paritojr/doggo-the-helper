import { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { countingChannels } from '../../database.js';
export default {
   data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription("counting game")
        .setContexts([0])
        .setIntegrationTypes(0)
        .addSubcommand(subcommand =>
           subcommand
            .setName('help')
            .setDescription('get help about counting game')
         )
        .addSubcommand(subcommand =>
           subcommand
            .setName('stats')
            .setDescription('get current stats about counting game')
         ),

   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "help") {
        const infolol = `the counting game is a game where everyone takes turns to count sequentially one by one

        **rules:**
        \\- a person can't count twice
        \\- non numeric inputs are ignored

        **save system:**
        \\- the server earns **1 save** every **100** correct numbers.
        \\- you can hold a maximum of **7** saves.
        \\- if someone makes a mistake, a save is used, and the game doesn't reset

        if you get a correct number the bot reacts with "✅", otherwise it will react with "❌" and the game will restart (unless you have at least a save ofc)
        if the channel gets to the goal the game ends

        that's it, have fun! :)
        
        `
        const funnyembed = new EmbedBuilder()
            .setTitle("counting game overview")
            .setDescription(`${infolol}`)
            .setColor("#3060f1");

        await interaction.reply({
            embeds: [funnyembed],
        });
      } else if (subcommand === "stats") {
         const data = countingChannels.get(interaction.channel.id);
         if (!data) {
            return interaction.reply({
               content: "this channel has no counting game",
               flags: MessageFlags.Ephemeral
            });
         }
         
         const { current, goal, lastUser, saves = 0, highest = 0 } = data;
         const remaining = Math.max(goal - current, 0);
         const percent = Math.min((current / goal) * 100, 100).toFixed(1);
         
         const incredibleEmbed = new EmbedBuilder()
         .setTitle("counting stats")
         .setColor("#3060f1")
         .addFields(
            { name: "current number", value: String(current), inline: true },
            { name: "goal", value: String(goal), inline: true },
            { name: "remaining", value: String(remaining), inline: true },
            { name: "progress", value: `${percent}%`, inline: true },
            { name: "saves", value: `${saves}/7`, inline: true },
            { name: "highest streak", value: String(highest), inline: true }, 
            { name: "last counter", value: lastUser ? `<@${lastUser}>` : "none", inline: true }
         );
         
         return interaction.reply({
            embeds: [incredibleEmbed]
         });
      }
   }
};