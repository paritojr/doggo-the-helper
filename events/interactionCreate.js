module.exports = (client, { slashcmds }) => {
   client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const { commandName } = interaction;

      try {
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