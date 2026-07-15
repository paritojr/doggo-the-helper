import { client } from "./client.js";
import { starBoards } from "./database.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

function buildMessage(message, starCount, emoji) {
  const embed = new EmbedBuilder()
    .setColor(0xdd2f46)
    .setAuthor({ 
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL({ dynamic: true }) 
    })
    .setFooter({ text: `message id: ${message.id}` })
    .setTimestamp(message.createdAt);

  if (message.content && message.content.trim().length > 0) {
    embed.setDescription(message.content);
  }

  const attachment = message.attachments.first();
  if (attachment && attachment.contentType?.startsWith("image/")) {
    embed.setImage(attachment.url);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("jump to message")
      .setStyle(ButtonStyle.Link)
      .setURL(message.url)
  );

  return {
    content: `${emoji} **${starCount}** | ${message.url}`,
    embeds: [embed],
    components: [row]
  };
}

client.on("messageReactionAdd", async (reaction) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  if (!reaction.message.guild) return;

  const { message } = reaction;
  const guildId = message.guild.id;

  let serverStarboards = starBoards.get(guildId);
  if (!serverStarboards) return;
  if (!Array.isArray(serverStarboards)) serverStarboards = [serverStarboards];

  const currentEmojiName = reaction.emoji.id 
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  for (const config of serverStarboards) {
    if (!config || !config.starboardChannelId) continue;

    const targetEmoji = config.emoji ?? "⭐";
    if (reaction.emoji.name !== targetEmoji && reaction.emoji.id !== targetEmoji && currentEmojiName !== targetEmoji) continue;

    if (!config.posts) config.posts = {};

    const starCount = reaction.count;
    const threshold = config.threshold ?? 5;
    const existingStarboardMsgId = config.posts[message.id];

    if (starCount < threshold && !existingStarboardMsgId) continue;

    const starboardChannel = message.guild.channels.cache.get(config.starboardChannelId);
    if (!starboardChannel) continue;

    const payload = buildMessage(message, starCount, targetEmoji);

    if (existingStarboardMsgId) {
      try {
        const starboardMsg = await starboardChannel.messages.fetch(existingStarboardMsgId);
        await starboardMsg.edit(payload);
      } catch {
        delete config.posts[message.id];
        starBoards.set(guildId, serverStarboards);
      }
    } else if (starCount >= threshold) {
      try {
        const sentMsg = await starboardChannel.send(payload);
        config.posts[message.id] = sentMsg.id;
        starBoards.set(guildId, serverStarboards);
      } catch (err) {
        console.error(err);
      }
    }
  }
});

client.on("messageReactionRemove", async (reaction) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch { 
      return;
    }
  }

  if (!reaction.message.guild) return;

  const { message } = reaction;
  const guildId = message.guild.id;

  let serverStarboards = starBoards.get(guildId);
  if (!serverStarboards) return;
  if (!Array.isArray(serverStarboards)) serverStarboards = [serverStarboards];

  const currentEmojiName = reaction.emoji.id 
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  for (const config of serverStarboards) {
    if (!config || !config.starboardChannelId || !config.posts) continue;

    const targetEmoji = config.emoji ?? "⭐";
    if (reaction.emoji.name !== targetEmoji && reaction.emoji.id !== targetEmoji && currentEmojiName !== targetEmoji) continue;

    const existingStarboardMsgId = config.posts[message.id];
    if (!existingStarboardMsgId) continue;

    const starboardChannel = message.guild.channels.cache.get(config.starboardChannelId);
    if (!starboardChannel) continue;

    const starCount = reaction.count;
    const threshold = config.threshold ?? 5;

    try {
      const starboardMsg = await starboardChannel.messages.fetch(existingStarboardMsgId);
      if (starCount < threshold) {
        await starboardMsg.delete();
        delete config.posts[message.id];
        starBoards.set(guildId, serverStarboards);
      } else {
        const payload = buildMessage(message, starCount, targetEmoji);
        await starboardMsg.edit(payload);
      }
    } catch {
      delete config.posts[message.id];
      starBoards.set(guildId, serverStarboards);
    }
  }
});
