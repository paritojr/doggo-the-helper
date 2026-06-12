import CatDB from "./utils/catDB.js";

const db = new CatDB("./db/catdb.sqlite");

const activeGiveaways = db.map("giveaways");
const postboardChannels = db.set("postboards");
const coinz = db.map("coinz");
const countingChannels = db.map("counting")
const dailycoinzt = db.map("dcoinzt");
const dangerChannels = db.set("dangerch");
const dailyMiaChannels = db.map("dmiach");
const reminders = db.map("reminders");
const linkedChannels = db.map("lnkch");

export {
  db,
  activeGiveaways,
  postboardChannels,
  coinz,
  countingChannels,
  dailycoinzt,
  dailyMiaChannels,
  dangerChannels,
  reminders,
  linkedChannels
};