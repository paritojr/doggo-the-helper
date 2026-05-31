import { SlashCommandBuilder, MessageFlags } from 'discord.js';
export default {
   data: new SlashCommandBuilder()
        .setName('random')
        .setDescription("get random things")
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addSubcommand(subcommand =>
           subcommand
            .setName('cat')
            .setDescription('get a random cat!')
         )
        .addSubcommand(subcommand =>
           subcommand
            .setName('dog')
            .setDescription('get a random dog!')
         )
        .addSubcommand(subcommand =>
           subcommand
            .setName('number')
            .setDescription('get a random number!')
            .addIntegerOption(option =>
               option
               .setName('min')
               .setDescription('minimum number')
               .setRequired(false)
            )
            .addIntegerOption(option =>
               option
               .setName('max')
               .setDescription('maximum number')
               .setRequired(false)
            )
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
      } else if (subcommand === "number") {
         let min = interaction.options.getInteger('min') ?? 1;
         let max = interaction.options.getInteger('max') ?? 1000;
         if (min > max) {
            return interaction.reply({
               content: 'min cannot be bigger than max!',
               flags: MessageFlags.Ephemeral
            });
         }
         const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
         interaction.reply(`your random number: ${randomNumber}`);
      }
   }
};