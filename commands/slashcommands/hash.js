import { SlashCommandBuilder } from "discord.js";
import crypto from "crypto"

export default {
    data: new SlashCommandBuilder()
    .setName("hash")
    .setDescription("hash sum text")
    .addStringOption(option =>
        option.setName('type')
        .setDescription('algorithm to hash')
        .setRequired(true)
        .addChoices(
            { name: "MD5", value: "md5" },
            { name: "SHA-1", value: "sha1" },
            { name: "SHA-256", value: "sha256" },
            { name: "SHA-512", value: "sha512" }
        )
    )
    .addStringOption(option =>
        option.setName('text')
        .setDescription('text 2 hash')
        .setRequired(true)
    ),
    async execute(interaction) {
        const type = interaction.options.getString("type");
        const text = interaction.options.getString("text");
        const hash = crypto.createHash(type)
        .update(text)
        .digest("hex");
        
        await interaction.reply(`\`${hash}\``);
    }
}