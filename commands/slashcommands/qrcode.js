const QRCode = require('qrcode');
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
        .setName('qrcode')
        .setDescription('generate a qr code')
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
      await interaction.reply({ content: 'qr code gen failed', ephemeral: true });
    }
  }
};