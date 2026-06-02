import messageCreate from "./events/messageCreate.js";
import interactionCreate from "./events/interactionCreate.js";
import { slashcmds, textcmds } from "./commands/index.js";
import config from "../config.json" with { type: "json" };

export async function createEvents(client) {
    messageCreate(client, { prefix:config.prefix, textcmds });
    interactionCreate(client, { slashcmds });
}