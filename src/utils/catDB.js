import Database from "better-sqlite3";

class CatDB {
  constructor(path = "./db/catDB.sqlite") {
    this.data = {};
    this._saveTimeout = null;
    this._dirty = new Set();

    this.db = new Database(path);

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS store (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

    this._load();
  }

  _load() {
    const rows = this.db.prepare("SELECT key, value FROM store").all();

    for (const row of rows) {
      try {
        this.data[row.key] = JSON.parse(row.value);
      } catch {
        this.data[row.key] = {};
      }
    }
  }

  _scheduleSave() {
    if (this._saveTimeout) return;
    this._saveTimeout = setTimeout(() => {
      if (this._dirty.size === 0) {
        this._saveTimeout = null;
        return;
      }

      const stmt = this.db.prepare(`
        INSERT INTO store (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      const transaction = this.db.transaction(() => {
        for (const key of this._dirty) {
          stmt.run(key, JSON.stringify(this.data[key]));
        }
      });

      transaction();

      this._dirty.clear();
      this._saveTimeout = null;
    }, 300);
  }

  getStore(name, defaultValue) {
    if (!this.data[name]) {
      this.data[name] = defaultValue;
      this._dirty.add(name);
      this.save();
    }
    return this.data[name];
  }

  save() {
    for (const key of Object.keys(this.data)) {
      this._dirty.add(key);
    }

    this._scheduleSave();
  }
}

class CatDBMap {
  constructor(db, key) {
    this.db = db;
    this.key = key;
    this.store = db.getStore(key, {});
  }

  get(k) {
    return this.store[k];
  }

  set(k, v) {
    this.store[k] = v;
    this.db.save();
    return this;
  }

  delete(k) {
    delete this.store[k];
    this.db.save();
    return true;
  }

  has(k) {
    return k in this.store;
  }

  clear() {
    this.db.data[this.key] = {};
    this.store = this.db.data[this.key];
    this.db.save();
  }

  values() {
    return Object.values(this.store);
  }

  keys() {
    return Object.keys(this.store);
  }

  entries() {
    return Object.entries(this.store);
  }
}

class CatDBSet {
  constructor(db, key) {
    this.db = db;
    this.key = key;
    this.store = db.getStore(key, []);
  }

  add(value) {
    if (!this.store.includes(value)) {
      this.store.push(value);
      this.db.save();
    }
    return this;
  }

  delete(value) {
    const index = this.store.indexOf(value);
    if (index !== -1) {
      this.store.splice(index, 1);
      this.db.save();
    }
    return true;
  }

  has(value) {
    return this.store.includes(value);
  }

  clear() {
    this.db.data[this.key] = [];
    this.store = this.db.data[this.key];
    this.db.save();
  }

  values() {
    return this.store.values();
  }
}

export { CatDB, CatDBMap, CatDBSet };