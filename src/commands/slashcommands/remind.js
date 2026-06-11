import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { parseTime } from "../../utils/parseTime.js";
import { reminders } from "../../database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("sets a reminder for something")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2])
    .addStringOption(option =>
      option
        .setName("time")
        .setDescription("duration (examples: 1d, 2h, 10m)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("what to remind you about")
        .setRequired(true)
    ),

  async execute(interaction) {
    const timeInput = interaction.options.getString("time");
    const reminder = interaction.options.getString("message");

    const duration = parseTime(timeInput);

    if (!duration) {
      return interaction.reply({
        content: "invalid time format, use format like: 1d, 5h, 30m",
        flags: MessageFlags.Ephemeral,
      });
    }

    const remindAt = Date.now() + duration;
    const timestamp = Math.floor(remindAt / 1000);
    const userReminders = reminders.get(interaction.user.id) ?? [];

    userReminders.push({
      reminder,
      remindAt,
    });

    reminders.set(interaction.user.id, userReminders);

    setTimeout(async () => {
      try {
        await interaction.user.send(`reminder: ${reminder}`);
      } catch (err) {
        console.log("couldn't dm user");
      }
      
      const userReminders = reminders.get(interaction.user.id) ?? [];
      const updated = userReminders.filter(
        r => !(r.remindAt === remindAt && r.reminder === reminder)
      );
      
      if (updated.length === 0) {
        reminders.delete(interaction.user.id);
      } else {
        reminders.set(interaction.user.id, updated);
      }
    }, duration);

    return interaction.reply({
      content: `k, i'll remind you in <t:${timestamp}:R> :)`,
      flags: MessageFlags.Ephemeral,
    });
  },
};