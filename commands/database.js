import { CatDB, CatDBMap, CatDBSet } from "../utils/catDB.js";

const db = new CatDB("./db/catdb.json");

const activeGiveaways = new CatDBMap(db, "giveaways");
const postboardChannels = new CatDBSet(db, "postboards");
const coinz = new CatDBMap(db, "coinz");
const dailycoinzt = new CatDBMap(db, "dcoinzt");

export {
  db,
  activeGiveaways,
  postboardChannels,
  coinz,
  dailycoinzt
};