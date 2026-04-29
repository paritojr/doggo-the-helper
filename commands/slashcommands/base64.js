import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Buffer } from "buffer";

export default {
    data: new SlashCommandBuilder()
    .setName("base64")
    .setDescription("encode or decode a string with base64")
    .addSubcommand(subcommand =>
        subcommand
        .setName('encode')
        .setDescription('encode a string with base64')
         .addStringOption(option =>
            option.setName('text')
            .setDescription('text to encode')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
         subcommand
         .setName('decode')
         .setDescription('decode a string with base64')
         .addStringOption(option =>
            option.setName('text')
            .setDescription('text to decode')
            .setRequired(true))
    ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "encode") {
            const inputlol = interaction.options.getString("text");
            const string = Buffer.from(inputlol, "utf8").toString("base64");
            const funnyembed = new EmbedBuilder()
            .setTitle("results:")
            .setDescription(`\`\`\`\n${string}\n\`\`\``);

            await interaction.reply({
                embeds: [funnyembed],
            });
        } else if (subcommand === "decode") {
            const inputlol = interaction.options.getString("text");
            const string = Buffer.from(inputlol, "base64").toString("utf8");
            const funnyembed = new EmbedBuilder()
            .setTitle("results:")
            .setDescription(`${string}`);

            await interaction.reply({
                embeds: [funnyembed],
            });
        }
    }
}