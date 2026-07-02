import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { isPlaying, starterId, activePlayer } from "./playvc.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stopvc")
    .setDescription("stops vc playback")
    .setIntegrationTypes(0)
    .setContexts([0]),

  async execute(interaction) {
    if (!isPlaying) {
      return interaction.reply({
        content: "nothing is playing, so umm...",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.user.id !== starterId) {
      return interaction.reply({
        content: "you can't use this rn!",
        flags: MessageFlags.Ephemeral,
      });
    }
    try {
      await interaction.reply({
        content: "alright, done! playback is stopped rn :)",
        flags: MessageFlags.Ephemeral,
      });
      activePlayer.stop(true);
    } catch (err) {
      console.error(err);
    }
  },
};