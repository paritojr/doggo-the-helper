import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { execSync } from "child_process";

export default {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("about the bot")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),

  async execute(interaction) {
    const stupidData = await interaction.client.application.fetch();
    const amazingEmbed = new EmbedBuilder()
      .setColor("#3060f1")
      .setAuthor({ 
        name: "bot info",
        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 256 })
      })
      .setDescription("hello! i'm doggo the helper, a free and open-source multi-purpose discord bot with all the features you'll ever need from a discord bot :)")
      .addFields(
        { name: "server installs", value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: "user installs", value: `${stupidData.approximateUserInstallCount || 0}`, inline: true },
        { name: "RAM usage", value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: "uptime", value: `<t:${Math.floor((Date.now() - (process.uptime() * 1000)) / 1000)}:R>`, inline: true },
        { name: "latest commit", value: `\`${execSync("git rev-parse --short HEAD").toString().trim()}\``, inline: true },
        { name: "api latency", value: `${interaction.client.ws.ping}ms`, inline: true }
      )
      .setFooter({
        text: "made with ❤️ by paritojr",
      });
    
    const buttons = [
      new ButtonBuilder()
        .setLabel("source code")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/paritojr/doggo-the-helper")
      ];
      
    if (process.env.INVITE_LINK) {
      buttons.unshift(
        new ButtonBuilder()
          .setLabel("invite the bot here!")
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.INVITE_LINK)
        );
      }

    const actionRow = new ActionRowBuilder().addComponents(buttons);
    return interaction.reply({
      embeds: [amazingEmbed],
      components: [actionRow]
    });
  },
};
