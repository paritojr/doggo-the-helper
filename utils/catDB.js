import fs from "fs";
class CatDB {
  constructor(path = "./db/catDB.json") {
    this.path = path;
    this.data = {};
    this._load();
    this._saveTimeout = null;
  }
  _load() {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({}));
    }
    try {
      this.data = JSON.parse(fs.readFileSync(this.path));
    } catch {
      this.data = {};
    }
  }

  _scheduleSave() {
    if (this._saveTimeout) return;

    this._saveTimeout = setTimeout(() => {
      fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
      this._saveTimeout = null;
    }, 500);
  }

  getStore(name, defaultValue) {
    if (!this.data[name]) {
      this.data[name] = defaultValue;
    }
    return this.data[name];
  }

  save() {
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