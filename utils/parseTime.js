function parseTime(timeString) {
    const timeRegex = /^(\d+)([dhm])$/;
    const match = timeString.match(timeRegex);
    if (!match) return null;
    const amount = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case "d":
            return amount * 24 * 60 * 60 * 1000;
        case "h":
            return amount * 60 * 60 * 1000;
        case "m":
            return amount * 60 * 1000;
        default:
            return null;
    }
}
export {
  parseTime
};