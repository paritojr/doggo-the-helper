const QRCode = require('qrcode');
async function qrcodebruh(interaction) {
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
module.exports = {
   qrcodebruh
};