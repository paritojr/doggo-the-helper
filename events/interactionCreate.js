module.exports = (client, { slashcmds }) => {
   client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const { commandName } = interaction;

      try {
         if (commandName === "hello") {
            return interaction.reply({content: "hello there!", ephemeral: true});
         }
         if (commandName === "ping") {
            return interaction.reply({content: `pong! hello ${interaction.user}!`,ephemeral: true});
         }
         const cmd = slashcmds[commandName];
         if (!cmd) {
            return interaction.reply({
               content: "Unknown command.",
               ephemeral: true
            });
         }
         await cmd(interaction, client);
      } catch (err) {
         console.error(err);
      }
   });
};