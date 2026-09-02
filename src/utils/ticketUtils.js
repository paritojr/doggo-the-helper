import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ticketPanels } from "../database.js";
import { client } from "../client.js";

export async function tInitialize(channelId) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    const panelData = ticketPanels.get(channelId);
    if (!panelData) return;

    const embed = new EmbedBuilder()
      .setTitle(`${panelData.name}`)
      .setDescription(panelData.description || "Click the button below to open a private support ticket.")
      .setColor(0x5865F2);

    const button = new ButtonBuilder()
      .setCustomId("ticket_open")
      .setLabel("Create Ticket")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📩");

    const row = new ActionRowBuilder().addComponents(button);

    const message = await channel.send({
      embeds: [embed],
      components: [row]
    });

    panelData.messageId = message.id;
    ticketPanels.set(channelId, panelData);
  } catch (error) {
    console.error(error);
  }
}

export async function tDestroy(channelId) {
  try {
    const panelData = ticketPanels.get(channelId);
    const channel = await client.channels.fetch(channelId);
    if (!channel || !panelData || !panelData.messageId) return;

    const message = await channel.messages.fetch(panelData.messageId);
    if (message) {
      await message.delete();
    }
  } catch (error) {
    console.error(error);
  }
}

export async function tModify(channelId) {
  try {
    const panelData = ticketPanels.get(channelId);
    const channel = await client.channels.fetch(channelId);
    if (!channel || !panelData || !panelData.messageId) return;

    const message = await channel.messages.fetch(panelData.messageId).catch(() => null);
    if (!message) {
      /*
      i'm sure this will be used for like, the 1 server that used this before this change
      like 99.9% of the servers using doggo the helper won't even trigger this condition
      and it will be only used once unless crazy shit goes on
      in which i'll personally be surprised bc there would be no fucking way that shit would be real
      */
      return await tInitialize(channelId);
    }

    const updatedEmbed = new EmbedBuilder()
      .setTitle(`${panelData.name}`)
      .setDescription(panelData.description || "Click the button below to open a private support ticket.")
      .setColor(0x5865F2);

    await message.edit({
      embeds: [updatedEmbed]
    });
  } catch (error) {
    console.error("wii have an error:", error);
  }
}
