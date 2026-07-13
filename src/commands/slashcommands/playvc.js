import { SlashCommandBuilder, MessageFlags, ChannelType } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus, demuxProbe } from "@discordjs/voice";
import { Readable } from "node:stream";

export let isPlaying = false;
export let starterId = null;
export let activePlayer = null;

let usageCount = 0;
let cooldownEndTime = 0;
const COOLDOWN_DURATION = 20 * 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName("playvc")
    .setDescription("plays audio on a voice channel")
    .setIntegrationTypes(0)
    .setContexts([0])
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("vc to join")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option
        .setName("audio")
        .setDescription("upload an audio file")
        .setRequired(true)
    ),

  async execute(interaction) {
    const isOwner = interaction.user.id === process.env.OWNER_ID;
    const now = Date.now();

    if (!isOwner && now < cooldownEndTime) {
      return interaction.reply({
        content: `erm, srry but you gotta wait till <t:${Math.floor(cooldownEndTime / 1000)}:R> to play in vc again lol`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (isPlaying) {
      return interaction.reply({
        content: "already playing audio, duh",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channel = interaction.options.getChannel("channel");
    const attachment = interaction.options.getAttachment("audio");
    if (!attachment.contentType?.startsWith("audio/")) {
      return interaction.reply({
        content: "only audio files!",
        flags: MessageFlags.Ephemeral,
      });
    }
    let connection;
    let player;
    let maxDurationTimeout = null;
    try {
      await interaction.reply({
        content: `alright, playing on vc now!`,
        flags: MessageFlags.Ephemeral
      });
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
      const response = await fetch(attachment.url);
      if (!response.body) {
        throw new Error("no response body :(");
      }

      const stream = Readable.fromWeb(response.body);
      const { stream: probedStream, type } = await demuxProbe(stream);
      const resource = createAudioResource(probedStream, {
        inputType: type,
      });
      player = createAudioPlayer();
      connection.subscribe(player);
      isPlaying = true;
      starterId = interaction.user.id;
      activePlayer = player;
      player.play(resource);

      if (!isOwner) {
        usageCount++;
        if (usageCount >= 3) {
          cooldownEndTime = Date.now() + COOLDOWN_DURATION;
          usageCount = 0;
        }
      }

      if (!isOwner) {
        maxDurationTimeout = setTimeout(() => {
          if (player) player.stop();
        }, 60 * 1000);
      }
      const cleanup = () => {
        if (maxDurationTimeout) clearTimeout(maxDurationTimeout);
        isPlaying = false;
        starterId = null;
        activePlayer = null;
        if (connection) {
          try {
            connection.destroy();
          } catch (e) {
            console.error("conn destroy error (sad):", e);
          }
          connection = null;
        }
      };
      player.once(AudioPlayerStatus.Idle, cleanup);
      player.once("error", err => {
        console.error("audio error fuck:", err);
        cleanup();
      });
    } catch (err) {
      console.error(err);
      isPlaying = false;
      starterId = null;
      activePlayer = null;
      if (maxDurationTimeout) clearTimeout(maxDurationTimeout);
      if (connection) {
        try { connection.destroy(); } catch(e) {}
      }
      if (!interaction.replied) {
        await interaction.reply({
          content: "failed to play audio",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
