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

  const config = starBoards.get(guildId);
  if (!config || !config.starboardChannelId) return;

  const targetEmoji = config.emoji ?? "⭐";
  const currentEmojiName = reaction.emoji.id 
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  if (reaction.emoji.name !== targetEmoji && reaction.emoji.id !== targetEmoji && currentEmojiName !== targetEmoji) return;

  if (!config.posts) config.posts = {};

  const starCount = reaction.count;
  const threshold = config.threshold ?? 5;
  const existingStarboardMsgId = config.posts[message.id];

  if (starCount < threshold && !existingStarboardMsgId) return;

  const starboardChannel = message.guild.channels.cache.get(config.starboardChannelId);
  if (!starboardChannel) return;

  const payload = buildMessage(message, starCount, targetEmoji);

  if (existingStarboardMsgId) {
    try {
      const starboardMsg = await starboardChannel.messages.fetch(existingStarboardMsgId);
      await starboardMsg.edit(payload);
    } catch {
      delete config.posts[message.id];
      starBoards.set(guildId, config);
    }
  } else if (starCount >= threshold) {
    try {
      const sentMsg = await starboardChannel.send(payload);
      config.posts[message.id] = sentMsg.id;
      starBoards.set(guildId, config);
    } catch (err) {
      console.error(err);
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

  const config = starBoards.get(guildId);
  if (!config || !config.starboardChannelId || !config.posts) return;

  const targetEmoji = config.emoji ?? "⭐";
  const currentEmojiName = reaction.emoji.id 
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  if (reaction.emoji.name !== targetEmoji && reaction.emoji.id !== targetEmoji && currentEmojiName !== targetEmoji) return;

  const existingStarboardMsgId = config.posts[message.id];
  if (!existingStarboardMsgId) return;

  const starboardChannel = message.guild.channels.cache.get(config.starboardChannelId);
  if (!starboardChannel) return;

  const starCount = reaction.count;
  const threshold = config.threshold ?? 5;

  try {
    const starboardMsg = await starboardChannel.messages.fetch(existingStarboardMsgId);
    if (starCount < threshold) {
      await starboardMsg.delete();
      delete config.posts[message.id];
      starBoards.set(guildId, config);
    } else {
      const payload = buildMessage(message, starCount, targetEmoji);
      await starboardMsg.edit(payload);
    }
  } catch {
    delete config.posts[message.id];
    starBoards.set(guildId, config);
  }
});
