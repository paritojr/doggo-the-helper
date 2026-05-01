import { SlashCommandBuilder } from 'discord.js';
export default {
   data: new SlashCommandBuilder()
        .setName('random')
        .setDescription("get a random cat, or a random dog")
        .addSubcommand(subcommand =>
         subcommand
         .setName('cat')
         .setDescription('get a random cat!')
         )
        .addSubcommand(subcommand =>
          subcommand
          .setName('dog')
          .setDescription('get a random dog!')
         ),

   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "dog") {
         const res = await fetch('https://dog.ceo/api/breeds/image/random');
         const data = await res.json();
         interaction.reply(data.message);
      } else if (subcommand === "cat") {
         const randomNumber = Math.floor(Math.random() * 1986);
         const res = await fetch(`https://cataas.com/api/cats?limit=1&skip=${randomNumber}`);
         const data = await res.json();
         interaction.reply(`https://cataas.com/cat/${data[0].id}`);
      }
   }
};