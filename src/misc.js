import { client } from "./client.js"
import { postboardChannels, dangerChannels, countingChannels, linkedChannels, dailyMiaChannels, starBoards, activeGiveaways, ticketPanels } from "./database.js";
import { timeoutsig } from "./utils/dailycontent.js";
import { giveawayTimeouts } from "./utils/restoreTimeouts.js";
import { WebhookClient, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } from "discord.js";

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const isPostboardChannel = postboardChannels.has(message.channel.id);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isDangerChannel = dangerChannels.has(message.channel.id);
    const isCountingChannel = countingChannels.has(message.channel.id);

    if (isDangerChannel) {
        if (isOwner || message.member.permissions.has("Administrator") || message.member.permissions.has("ManageMessages")) return;
        try {
            await message.delete().catch(() => {});
            await message.guild.members.ban(message.author.id, {
                reason: "triggered anti-spam channel"
            });
        } catch (err) {
            console.error("error:", err);
        }
        return;
    }

    if (isCountingChannel) {
        const state = countingChannels.get(message.channel.id);
        if (!state) return;
            
        const raw = message.content.trim();
        const match = raw.match(/^\d+/); 
        if (!match) return;
            
        const num = Number(match[0]);
        const expected = state.current + 1;
        
        const MILESTONE_EVERY = 50;
        const MAX_SAVES = 15; 

        if (message.author.id === state.lastUser || num !== expected) {
            if (state.saves && state.saves > 0) {
                state.saves -= 1;
                state.lastUser = null;
                countingChannels.set(message.channel.id, state);
                
                //...but it refused
                await message.reply(`${message.author} ruined it! game starts back again now\n*...but it refused*\nthanks to your saves, you still are in **${state.current}**, but you have now only **${state.saves}** saves`);
                return;
            }
            await message.react('❌').catch(()=>{});
            await message.reply(`${message.author} ruined it! game starts back again now`)
            state.highest = Math.max(state.highest ?? 0, state.current);
            state.current = 0;
            state.lastUser = null;
            countingChannels.set(message.channel.id, state);
            return;
        }
            
        state.current = num;
        state.lastUser = message.author.id;
        state.highest = Math.max(state.highest ?? 0, state.current);
        
        if (state.saves === undefined) state.saves = 0;
        if (state.current % MILESTONE_EVERY === 0) {
            if (state.saves < MAX_SAVES) {
                state.saves += 1;
                await message.channel.send(`**milestone reached!** the server now has **${state.current}** and earned 1 save!\ntotal: **${state.saves}/${MAX_SAVES}** saves`).catch(()=>{});
            }
        }

        countingChannels.set(message.channel.id, state);
        await message.react('✅').catch(()=>{});
        if (state.goal && state.current >= state.goal) {
            await message.channel.send(`goal reached dudes: ${state.current}`).catch(()=>{});
            state.current = 0;
            state.lastUser = null;
            state.saves = 0;
            countingChannels.set(message.channel.id, state);
        }
        return;
    }

    for (const [id, link] of linkedChannels.entries()) {
        if (!link?.source?.id || !link?.target?.id) continue;

        const isSource = message.channel.id === link.source.id;
        const isTarget = message.channel.id === link.target.id;

        if (!isSource && !isTarget) continue;
        const destination = isSource ? link.target : link.source;
        if (!destination.url) continue;
        
        try {
            const webhookClient = new WebhookClient({ url: destination.url });
            const hasSnapshot = message.messageSnapshots && (message.messageSnapshots.length > 0 || message.messageSnapshots.size > 0);
            const targetMessage = message.messageSnapshots?.first?.() || message;
            const files = targetMessage?.attachments ? targetMessage.attachments.filter(att => att.size <= 5242880).map(att => att.url) : [];
            let contentText = targetMessage?.content || "";
            //i made this, zach modified this, and i stole it
            const stickers = targetMessage?.stickers?.filter(s => s.type !== 1 && !s.url.endsWith('.json')).map(s => `${s.url}?size=160`) || [];
            if (stickers.length > 0) {
                contentText += `\n${stickers.join("\n")}`;
            }
            if (hasSnapshot && contentText.trim()) {
                //once again i stole shit from zach lmao
                contentText = `-# ↷ *Forwarded*\n${contentText}`;
            }

            if (!contentText.trim() && files.length === 0) continue;
            const name = message.member?.nickname 
                ? `${message.member.nickname} (${message.member.user?.globalName || message.author.username})` 
                : (message.member?.displayName || message.author.displayName);
            
            await webhookClient.send({
              content: contentText.trim() || undefined,
              username: name.substring(0, 80),
              avatarURL: message.author.displayAvatarURL({ forceStatic: false }),
              files: files.length > 0 ? files : undefined,
              allowedMentions: { parse: [] }
            });
        } catch (error) {
            //did you seriously expect a professional error handler
            //look im not THAT type of guy shut the fuck up
            console.error(`WE HAVE AN ERROR ON ${id} FUUUUUUUUUCK:`, error);
        }
        break;
    }

    if (isPostboardChannel) {
        try {
            if (message.hasThread) return;
            const name = `${message.author.username}'s post`;
            await message.startThread({
                name,
                autoArchiveDuration: 1440,
            });
            await message.react("🔥");
        } catch (err) {
            console.error("postboard error:", err);
        }
    }
});

client.on("guildDelete", async (guild) => {
    if (!guild) return;
    const channelIds = Array.from(guild.channels.cache.keys());
    
    for (const channelId of channelIds) {
        if (postboardChannels.has(channelId)) postboardChannels.delete(channelId);
        if (countingChannels.has(channelId)) countingChannels.delete(channelId);
        if (ticketPanels.has(channelId)) ticketPanels.delete(channelId);

        if (dailyMiaChannels.has(channelId)) {
            dailyMiaChannels.delete(channelId);
            const dailyTimeout = timeoutsig.get(channelId);
            if (dailyTimeout) {
                clearTimeout(dailyTimeout);
                timeoutsig.delete(channelId);
            }
        }
        
        if (linkedChannels.has(channelId)) linkedChannels.delete(channelId);
    }

    for (const [id, g] of activeGiveaways.entries()) {
        const giveawayguild = g.guildId || g.guildID;
        if (giveawayguild === guild.id) {
            activeGiveaways.delete(id);
            const giveawayTimeout = giveawayTimeouts.get(id);
            if (giveawayTimeout) {
                clearTimeout(giveawayTimeout);
                giveawayTimeouts.delete(id);
            }
        }
    }

    for (const [id, link] of linkedChannels.entries()) {
        if (guild.channels.cache.has(link.source) || guild.channels.cache.has(link.target)) {
            linkedChannels.delete(id);
        }
    }

    starBoards.delete(guild.id);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId === "ticket_open") {
    const panelData = ticketPanels.get(interaction.channel.id);
    if (!panelData) {
      return interaction.reply({
        content: "panel config missing (aka 404)",
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const ticketThread = await interaction.channel.threads.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.PrivateThread,
      invitable: false
    });

    await ticketThread.members.add(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle(`Ticket: ${panelData.name}`)
      .setDescription(panelData.description || "Click below to close this ticket.")
      .setColor(0x5865F2);

    const closeButton = new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔒");

    const row = new ActionRowBuilder().addComponents(closeButton);

    await ticketThread.send({
      content: `${interaction.user} & <@&${panelData.role}>`,
      embeds: [embed],
      components: [row]
    });

    return interaction.editReply({
      content: `Your ticket has been opened in ${ticketThread}`,
    });
  } else if (interaction.customId === "ticket_close") {
    const targetThread = interaction.channel;
    if (!targetThread || !targetThread.isThread()) return;

    const panelData = ticketPanels.get(targetThread.parentId);
    const shouldArchive = panelData ? panelData.swa : false;

    try {
      await interaction.update({ components: [] });
      if (shouldArchive) {
        await targetThread.setLocked(true);
        await targetThread.setArchived(true);
      } else {
        await targetThread.delete();
      }
    } catch {}
  }
});