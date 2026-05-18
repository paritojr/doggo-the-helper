import { SlashCommandBuilder, MessageFlags, ChannelType } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType, entersState, VoiceConnectionStatus } from "@discordjs/voice";
import { Readable } from "node:stream";
export let isPlaying = false;
export let starterId = null;
export let activePlayer = null;

export default {
  data: new SlashCommandBuilder()
    .setName("playvc")
    .setDescription("plays audio on a voice channel")
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
        .setDescription("upload an .ogg opus file")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (isPlaying) {
      return interaction.reply({
        content: "already playing audio, duh",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channel = interaction.options.getChannel("channel");
    const attachment = interaction.options.getAttachment("audio");
    if (!attachment.name.endsWith(".ogg") && !attachment.contentType?.includes("ogg")) {
      return interaction.reply({
        content: "only ogg files!",
        flags: MessageFlags.Ephemeral,
      });
    }
    let connection;
    let player;
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
      const resource = createAudioResource(stream, {
        inputType: StreamType.OggOpus,
      });
      player = createAudioPlayer();
      connection.subscribe(player);
      isPlaying = true;
      starterId = interaction.user.id;
      activePlayer = player;
      player.play(resource);
      const cleanup = () => {
        isPlaying = false;
        starterId = null;
        activePlayer = null;
        if (connection) connection.destroy();
      };
      player.once(AudioPlayerStatus.Idle, cleanup);
      player.once("error", err => {
        console.error("Audio player error:", err);
        cleanup();
      });
    } catch (err) {
      console.error(err);
      isPlaying = false;
      if (connection) connection.destroy();
      if (!interaction.replied) {
        await interaction.reply({
          content: "failed to play audio",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};