import { reminders, activeGiveaways, dailyMiaChannels, linkedChannels } from "../database.js"
import { stopGiveaway } from "./stopGiveaway.js";
import { scheduleDailyContent } from "./dailycontent.js";
import { client } from "../client.js";

export function restoreTimeouts() {
    //giveaways
    for (const [id, g] of activeGiveaways.entries()) {
        const timeLeft = g.endTime - Date.now();
        setTimeout(
            () => stopGiveaway(id),
            timeLeft > 0 ? timeLeft : 0
        );
    }

    //reminders
    for (const [userId, userReminders] of reminders.entries()) {
        for (const r of userReminders) {
            const timeLeft = r.remindAt - Date.now();
            setTimeout(async () => {
                try {
                    const user = await client.users.fetch(userId);
                    await user.send(`reminder: ${r.reminder}`);
                } catch (err) {
                    console.log("couldn't dm user");
                }
                const current = reminders.get(userId) ?? [];
                const updated = current.filter(
                    reminder => !(
                        reminder.remindAt === r.remindAt &&
                        reminder.reminder === r.reminder
                    )
                );
                if (updated.length === 0) {
                    reminders.delete(userId);
                } else {
                    reminders.set(userId, updated);
                }
            }, timeLeft > 0 ? timeLeft : 0);
        }
    }

    //daily stuff
    for (const [channelId, config] of dailyMiaChannels.entries()) {
        scheduleDailyContent(
            channelId,
            config,
        );
    }

    //expire unused bs
    //and also, i am not giving a fuck if this is an interval and not a timeout fuck it
    setInterval(() => {
        for (const [id, link] of linkedChannels.entries()) {
            if (!link) {
                linkedChannels.delete(id);
                continue;
            }
            const hasSource = !!link.source;
            const hasTarget = !!link.target;
            if (!hasSource || !hasTarget) {
                const age = Date.now() - (link.createdAt ?? 0);
                if (age > 30 * 60 * 1000) {
                    linkedChannels.delete(id);
                }
            }
        }
    }, 5 * 60 * 1000);
}