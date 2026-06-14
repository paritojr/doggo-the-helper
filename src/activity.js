import { client } from "./client.js";
import { ActivityType } from "discord.js";
let interval;
const statuses = [
    { name: "doggo the doggo", type: ActivityType.Playing },
    { name: "normal", type: ActivityType.Custom, state: "relaxing as a doggo :)",},
    { name: "wow", type: ActivityType.Custom, state: "life is awesome!" },
    { name: "lofi music", type: ActivityType.Listening },
    { name: "nice", type: ActivityType.Custom, state: "today's a great day!!!" }
];
function start() {
    client.user.setActivity("normal", {
        type: ActivityType.Custom,
        state: "relaxing as a doggo :)",
    });
    let currentIndex = 0;
    //customize this as you want! not only does it have to be 10 seconds, you know ;)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % statuses.length;
        const { name, type, state } = statuses[currentIndex];
        if (type === ActivityType.Custom) {
            client.user.setActivity(name, { type: type, state: state });
        } else {
            client.user.setActivity(name, { type: type });
        }
    }, 10000);
}
client.once("clientReady", start);