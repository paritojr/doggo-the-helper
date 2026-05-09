import { reminders, activeGiveaways } from "../commands/database.js"
import { stopGiveaway } from "./stopGiveaway.js";

export function restoreTimeouts(client) {
    //giveaways
    for (const [id, g] of activeGiveaways.entries()) {
        const timeLeft = g.endTime - Date.now();
        setTimeout(
            () => stopGiveaway(client, id),
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
}