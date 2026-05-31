import Database from "better-sqlite3";

export class CatDB {
  constructor(path = "./db/catdb.sqlite") {
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS store (
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
  }

  _get(key, ns) {
    const row = this.db.prepare(
      "SELECT value FROM store WHERE namespace = ? AND key = ?"
    ).get(ns, key);
    return row ? JSON.parse(row.value) : undefined;
  }

  _set(key, value, ns) {
    this.db.prepare(
      `INSERT INTO store (namespace, key, value)
       VALUES (?, ?, ?)
       ON CONFLICT(namespace, key)
       DO UPDATE SET value = excluded.value`
    ).run(ns, key, JSON.stringify(value));
  }

  _delete(key, ns) {
    this.db.prepare(
      "DELETE FROM store WHERE namespace = ? AND key = ?"
    ).run(ns, key);
  }
}

export class CatDBMap {
  constructor(db, key) {
    this.db = db;
    this.key = key;
  }

  get(k) {
    return this.db._get(k, this.key);
  }

  set(k, v) {
    this.db._set(k, v, this.key);
    return this;
  }

  delete(k) {
    this.db._delete(k, this.key);
    return true;
  }

  has(k) {
    return this.get(k) !== undefined;
  }

  keys() {
    return this.db.db.prepare(
      "SELECT key FROM store WHERE namespace = ?"
    ).all(this.key).map(r => r.key);
  }

  values() {
    return this.db.db.prepare(
      "SELECT value FROM store WHERE namespace = ?"
    ).all(this.key).map(r => JSON.parse(r.value));
  }

  entries() {
    return this.db.db.prepare(
      "SELECT key, value FROM store WHERE namespace = ?"
    ).all(this.key).map(r => [r.key, JSON.parse(r.value)]);
  }

  clear() {
    this.db.db.prepare(
      "DELETE FROM store WHERE namespace = ?"
    ).run(this.key);
  }
}

export class CatDBSet {
  constructor(db, key) {
    this.db = db;
    this.key = key;
  }

  add(value) {
    this.db.db.prepare(
      "INSERT OR IGNORE INTO set_items (namespace, value) VALUES (?, ?)"
    ).run(this.key, value);
    return this;
  }

  delete(value) {
    this.db.db.prepare(
      "DELETE FROM set_items WHERE namespace = ? AND value = ?"
    ).run(this.key, value);
    return true;
  }

  has(value) {
    return !!this.db.db.prepare(
      "SELECT 1 FROM set_items WHERE namespace = ? AND value = ?"
    ).get(this.key, value);
  }

  values() {
    return this.db.db.prepare(
      "SELECT value FROM set_items WHERE namespace = ?"
    ).all(this.key).map(r => r.value);
  }

  clear() {
    this.db.db.prepare(
      "DELETE FROM set_items WHERE namespace = ?"
    ).run(this.key);
  }
}