const timeoutsig = new Map();
function getNextRun(hour, minute) {
    const now = new Date();
    const next = new Date();

    next.setHours(hour, minute, 0, 0);

    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }

    return next;
}

export function scheduleDailyContent(client, channelId, config, dailyMiaChannels) {
    const run = async () => {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            await channel.send(await fetch("https://media.paritojr.co/mia/totalmias.json")
               .then(res => res.json())
               .then(data => `https://media.paritojr.co/mia/mia${Math.floor(Math.random() * data.total) + 1}.jpg`));
        }
        const latest = dailyMiaChannels.get(channelId);
        if (!latest) return;

        const next = getNextRun(latest.hour, latest.minute);
        const delay = next - Date.now();

        const timeout = setTimeout(run, delay);
        timeoutsig.set(channelId, timeout);
    };

    const next = getNextRun(config.hour, config.minute);
    const delay = next - Date.now();

    const timeout = setTimeout(run, delay);
    timeoutsig.set(channelId, timeout);
}

export function clearDailyContent(channelId) {
    const timeout = timeoutsig.get(channelId);
    if (timeout) clearTimeout(timeout);
    timeoutsig.delete(channelId);
}