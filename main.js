const db = require("quick.db");

/**
 * @extends {Map}
 * @extends {db}
 */
class Database {
  /**
   * @param {Object} [options]
   *
   * @param {String|Required} [options.tableName] (Required) to get the values from the table, Existing table or a New table is created
   *
   * @param {Boolean|Required} [options.inMemory] If true stores data in Memory else only in sqlite
   *
   * @param {*} [this.cache] this is the cache where the values are stored in memory for fast processing of snippets
   *
   * @param {*} [this.dbtable] get and set and other functions in values in table
   */

  constructor(options = {}) {
    this.table = options.tableName;
    this.inMemory = options.inMemory;
    this.cache = new Map();
    this.dbtable = new db.table(`${this.table}`);

    //error handling
    if (!this.table) return new TypeError("Must specify tableName");
    if (typeof this.inMemory === true || false)
      return new Error("Must specify type of memory/storage");
  }
  /**
   *
   * @param {*} key
   * @param {*} value
   * @param {*} ops
   */
  async set(key, value, ops) {
    if (this.inMemory) {
      this.cache.set(key, value, ops || {});
      this.dbtable.set(key, value, ops || {});
    } else {
      this.dbtable.set(key, value, ops || {});
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   * @returns
   */
  async get(key, ops) {
    if (this.inMemory) {
      if (this.cache.has(key, ops || {})) {
        return this.cache.get(key, ops || {});
      } else {
        return this.dbtable.get(key, ops || {});
      }
    } else {
      return this.dbtable.get(key, ops || {});
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   * @returns
   */
  async has(key, ops) {
    if (this.inMemory) {
      if (this.cache.has(key, ops || {})) {
        return this.cache.has(key, ops || {});
      } else {
        return this.dbtable.has(key, ops || {});
      }
    } else {
      return this.dbtable.has(key, ops || {});
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   * @returns
   */
  async fetch(key, ops) {
    return this.dbtable.fetch(key, ops || {});
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   */
  async delete(key, ops) {
    if (this.inMemory) {
      this.cache.delete(key, ops || {});
      this.dbtable.delete(key, ops || {});
    } else {
      this.dbtable.delete(key, ops || {});
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} value
   * @param {*} ops
   * @returns
   */
  async add(key, value, ops) {
    return this.dbtable.add(key, value, ops || {});
  }

  /**
   *
   * @param {*} key
   * @param {*} value
   * @param {*} ops
   * @returns
   */
  async subtract(key, value, ops) {
    return this.dbtable.subtract(key, value, ops || {});
  }

  /**
   *
   * @param {*} ops
   * @returns
   */
  async all(ops) {
    return this.dbtable.all(ops || {});
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   * @returns
   */
  async fetch(key, ops) {
    return this.dbtable.fetch(key, ops || {});
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   * @returns
   */
  async fetchAll(key, ops) {
    return this.dbtable.fetch(key, ops || {});
  }

  /**
   *
   * @param {*} key
   * @param {*} ops
   * @returns
   */
  async includes(key, ops) {
    return this.dbtable.includes(key, ops || {});
  }

  /**
   *
   * @param {*} key
   * @param {*} value
   * @param {*} ops
   */
  async push(key, value, ops) {
    this.dbtable.push(key, value, ops || {});
  }

  /**
   *
   * @returns
   */
  async clear() {
    return this.cache.clear();
  }

  /**
   *
   * @returns
   */
  async cacheSize() {
    return `Database cache size: ${this.cache.size}`;
  }
}

module.exports = Database;
