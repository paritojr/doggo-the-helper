import { CatDB, CatDBMap, CatDBSet } from "./utils/catDB.js";

const db = new CatDB("./db/catdb.sqlite");

const activeGiveaways = new CatDBMap(db, "giveaways");
const postboardChannels = new CatDBSet(db, "postboards");
const coinz = new CatDBMap(db, "coinz");
const countingChannels = new CatDBMap(db, "counting")
const dailycoinzt = new CatDBMap(db, "dcoinzt");
const dangerChannels = new CatDBSet(db, "dangerch");
const dailyMiaChannels = new CatDBMap(db, "dmiach");
const reminders = new CatDBMap(db, "reminders");

export {
  db,
  activeGiveaways,
  postboardChannels,
  coinz,
  countingChannels,
  dailycoinzt,
  dailyMiaChannels,
  dangerChannels,
  reminders
};