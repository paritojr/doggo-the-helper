import Database from "better-sqlite3";

const db = new Database(process.argv[2] || "./db/catdb.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS store_new (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY(namespace, key)
  );

  CREATE TABLE IF NOT EXISTS set_items (
    namespace TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY(namespace, value)
  );
`);

const hasNamespace = db.prepare("PRAGMA table_info(store)").all()
  .some(c => c.name === "namespace");

if (hasNamespace) {
  console.log("ok bro");
  process.exit(0);
}

const rows = db.prepare("SELECT key, value FROM store").all();
const insertStore = db.prepare(`
  INSERT INTO store_new (namespace, key, value)
  VALUES (?, ?, ?)
`);

const insertSet = db.prepare(`
  INSERT INTO set_items (namespace, value)
  VALUES (?, ?)
`);

db.transaction(() => {
  for (const row of rows) {
    const data = JSON.parse(row.value);

    if (Array.isArray(data)) {
      for (const v of data) {
        insertSet.run(row.key, String(v));
      }
    } else {
      for (const [k, v] of Object.entries(data)) {
        insertStore.run(row.key, k, JSON.stringify(v));
      }
    }
  }

  db.exec(`
    DROP TABLE store;
    ALTER TABLE store_new RENAME TO store;
  `);
})();

console.log("yo gurt ts is done");