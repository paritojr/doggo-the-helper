import QRCode from "qrcode";
import { SlashCommandBuilder, MessageFlags } from "discord.js";
export default {
  data: new SlashCommandBuilder()
        .setName('qrcode')
        .setDescription('generate a qr code')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option.setName('data')
                .setDescription('data to go on the qr code')
                .setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString('data');
    try {
      const buffer = await QRCode.toBuffer(text);
      await interaction.reply({
        files: [{ attachment: buffer, name: 'qrcode.png' }]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'qr code gen failed', Flags: MessageFlags.Ephemeral });
    }
  }
};