import { MessageFlags } from "discord.js";
import { client } from "../client.js"
import { slashcmds } from "../commands/index.js";
client.on("interactionCreate", async (interaction) => {
   if (!interaction.isChatInputCommand()) return;
   const { commandName } = interaction;

   try {
      const cmd = slashcmds[commandName];
      if (!cmd) {
         return interaction.reply({
            content: "Unknown command.",
            flags: MessageFlags.Ephemeral
         });
      }
      await cmd.execute(interaction, client);
   } catch (err) {
      console.error(err);
   }
});