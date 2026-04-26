const { CatDB, CatDBMap, CatDBSet } = require("../utils/catDB.js");

const db = new CatDB("./db/catdb.json");

const activeGiveaways = new CatDBMap(db, "giveaways");
const postboardChannels = new CatDBSet(db, "postboards");
const coinz = new CatDBMap(db, "coinz");
const dailycoinzt = new CatDBMap(db, "dcoinzt");

module.exports = {
  db,
  activeGiveaways,
  postboardChannels,
  coinz,
  dailycoinzt
};