import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';
import { isContentFlagged } from "../../utils/isContentFlagged.js";

export default {
   data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('creates a fantastic embed using discord modals')
        .setIntegrationTypes([0])
        .setContexts([0])
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

   async execute(interaction) {
      const thoseFields = [
         { id: 'title', label: 'title', style: TextInputStyle.Short, required: true },
         { id: 'description', label: 'description', style: TextInputStyle.Paragraph, required: true },
         { id: 'color', label: 'color in hex', style: TextInputStyle.Short, required: false, value: '#2a62fd' },
         { id: 'footer', label: 'footer', style: TextInputStyle.Short, required: false },
         { id: 'image', label: 'image url', style: TextInputStyle.Short, required: false }
      ];
      const customId = `embed-modal-${interaction.id}`;
      const modal = new ModalBuilder()
         .setCustomId(customId)
         .setTitle('embed maker')
         .addComponents(
            thoseFields.map(({ id, label, style, required, value }) => {
               const input = new TextInputBuilder()
                  .setCustomId(id)
                  .setLabel(label)
                  .setStyle(style)
                  .setRequired(required);
               if (value) input.setValue(value);
               return new ActionRowBuilder().addComponents(input);
            })
         );

      await interaction.showModal(modal);

      try {
         const submitted = await interaction.awaitModalSubmit({
            time: 300_000,
            filter: i => i.customId === customId && i.user.id === interaction.user.id,
         });
         const { fields } = submitted;
         const title = fields.getTextInputValue('title');
         const description = fields.getTextInputValue('description');
         const color = fields.getTextInputValue('color') || "#2a62fd";
         const footer = fields.getTextInputValue('footer') || null;
         const image = fields.getTextInputValue('image') || null;
         const isTheColorValid = /^#[0-9A-Fa-f]{6}$/.test(color);
         if (!isTheColorValid) {
            return submitted.reply({
               content: "whoops! color property is invalid, pls try again",
               flags: MessageFlags.Ephemeral
            });
         }

         const isFlagged = await isContentFlagged(submitted.guild, `${title} ${description} ${footer}`);
         if (isFlagged) {
            console.log("flagged");
            return submitted.reply({ 
               content: 'nuhuh, cant say that', 
               flags: MessageFlags.Ephemeral
            });
         }
         const awesomeEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp(Date.now());

         if (footer) {
            awesomeEmbed.setFooter({ text: footer });
         }

         if (image) {
            if (image.startsWith('http://') || image.startsWith('https://')) {
               awesomeEmbed.setImage(image);
            }
         }
         await submitted.channel.send({ embeds: [awesomeEmbed] });
         return submitted.reply({
            content: 'done ig',
            flags: MessageFlags.Ephemeral
         });
      } catch (error) {
         //deltarune reference real
         console.log("YOU'RE TAKING TOO LONG");
      }
   }
};