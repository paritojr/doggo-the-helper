const { CatDB, CatDBMap, CatDBSet } = require("../utils/catDB.js");

const db = new CatDB("./db/catdb.json");

const activeGiveaways = new CatDBMap(db, "giveaways");
const postboardChannels = new CatDBSet(db, "postboards");

module.exports = {
  db,
  activeGiveaways,
  postboardChannels
};