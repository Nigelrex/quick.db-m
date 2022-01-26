const quickdb = require("quick.db");
const ms = require("ms");
const pico = require("picocolors");
const fs = require("fs-extra");
const moment = require("moment");
const _ = require("lodash");

/**
 * @extends {Map}
 * @extends {db}
 */
module.exports = class Database {
  /**
   * @param {Object} options - "List of all the options"
   *
   * @param {String|Optional} options.tableName - "The name of the table to create"
   *
   * @param {String|Optional} options.dbPath - "(Optional) to specify the path of the database, default is ./json.sqlite"
   *
   * @param {Boolean|Optional} options.cache - "(Optional) to use in memory or not, default is false"
   *
   * @param {Boolean|Optional} options.clearCache - "Set to true if you want to clear cache"
   *
   * @param {Number|Optional} options.maxCacheLimit - "Set maxCacheLimit for clearing cache, defaults to 100"
   *
   * @param {String|Optional} options.clearCacheInterval - "Set interval to clear cache (defaults to "5m") [30s 5m 2d 1w 1y]"
   *
   * @param {String|Optional} options.expiryInterval - "Set interval to clear cache (defaults to "5s") [30s 5m 2d 1w 1y]"
   *
   * @param {Boolean|Optional} options.verbose - "If true prints the cache size and the cache size after clearing"
   *
   * @param {*} this.cache - "This is the cache where the values are stored in memory for fast processing of snippets"
   */

  constructor(options = {}) {
    //start of options
    this.table = options.tableName;
    this.dbPath = options.dbPath ?? "./json.sqlite";
    this.Cache = options.cache ?? false;
    this.clearCache = options.clearCache ?? false;
    this.maxCacheLimit = options.maxCacheLimit ?? 100;
    this.clearCacheInterval = options.clearCacheInterval ? ms(`${options.clearCacheInterval}`) : ms("5m");
    this.expiryInterval = options.expiryInterval ? ms(`${options.expiryInterval}`) : ms("5s");
    this.verbose = options.verbose ? options.verbose : false;
    //end of options
    fs.ensureDir(this.dbPath.split(/\w+\.\w+/g.exec(this.dbPath).pop())[0]);
    const db = quickdb(this.dbPath);
    this.cache = new Map();
    this.dbtable = this.table ? new db.table(`${this.table}`) : db;
    // Error handling
    // Memory \\
    if (typeof this.Cache !== "boolean") throw new Error(pico.red(`inMemory is typeof "Boolean"`));

    if (typeof this.clearCache !== "boolean") throw new Error(pico.red(`clearCache is typeof "Boolean"`));

    if (typeof this.maxCacheLimit !== "number") throw new Error(pico.red(`maxCacheLimit is typeof "number"`));

    // Verbose \\
    if (typeof this.verbose !== "boolean") throw new Error(pico.red(`Verbose typeof Boolean`));

    if (this.verbose) {
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`DataBase`)}: ${JSON.stringify(this.dbtable)}`);
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Cache:`)} ${this.Cache}`);
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`clearCache:`)} ${this.clearCache}`);
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`maxCacheLimit:`)} ${this.maxCacheLimit}`);
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`clearCacheInterval:`)} ${this.clearCacheInterval}ms`);
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`DataBase Path:`)} ${this.dbPath}`);

      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Verbose:`)} ${this.verbose}`);
    }

    //cache values that are in the sqlite file
    const needCache = this.all();
    needCache.forEach(async (value, key) => {
      if (this.verbose) {
        console.log(
          `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Caching:`)} ${JSON.stringify({
            ID: value.ID,
            value: value.data,
          })}`
        );
      }
      this.cache.set(value.ID, value.data);
    });
    if (this.verbose) console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Current cache size: `)} ${this.cacheSize()}`);

    //This is used to clear the cache every 5 minutes (By default)

    setInterval(() => {
      if (this.Cache && this.clearCache && this.cache.size >= this.maxCacheLimit) {
        if (this.verbose) {
          console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Clearing cache`)}`);
        }
        this.cache.clear();
        if (this.verbose) console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Current cache size:`)} ${this.cache.size}`);
      }
    }, this.clearCacheInterval);

    //delete expiry keys, values
    setInterval(() => {
      var dbarr = this.dbtable.all();
      const array = [];
      for (var i = 0; i < dbarr.length; i++) {
        array.push({
          ID: dbarr[i].ID,
          data: dbarr[i].data,
        });
      }
      array.forEach(async (ID, data) => {
        if (this.has(ID.ID)) {
          if (ID.data.expiry < moment().unix()) this.delete(ID.ID);
        }
      });
    }, this.expiryInterval);
  }
  /**
   * @private
   * @param {String} code
   * @returns code
   */
  async __async(code) {
    return await code;
  }

  /**
   *
   * @param {String} key  insert your key
   * @param {String} value  insert your value

   */
  set(key, value) {
    if (this.Cache) this.cache.set(key, value, {});
    this.dbtable.set(key, value, {});
  }

  /**
   *
   * @param {*} key "The value you want to set the expiry on"
   * @param {*} value "The expiry should go like { y:2010, M:3, d:5, h:15, m:10, s:3, ms:12} or { years:2010, months:3, days:5, hours:15, minutes:10, s:3, miliseconds:123}"
   */

  async expiry(key, value) {
    if (typeof value !== "object") throw new Error(pico.red(`value is typeof "object"`));
    this.set(`${key}.expiry`, moment(new Date()).add(value).unix(), {});
  }

  /**
   *
   * @param {String} key  insert your key

   * @returns
   */
  get(key) {
    if (this.Cache && this.cache.has(key, {})) return this.cache.get(key, {});

    return this.dbtable.get(key, {});
  }

  /**
   *
   * @param {String} key  insert your key

   * @returns
   */
  has(key) {
    if (this.Cache && this.cache.has(key, {})) return this.cache.has(key, {});

    return this.dbtable.has(key, {});
  }

  /**
   *
   * @param {String} key  insert your key

   */
  delete(key) {
    if (this.Cache) this.cache.delete(key, {});

    this.dbtable.delete(key, {});
  }

  /**
   * WARNING! This deletes the entire database keys and values
   *
   */
  deleteAll() {
    this.dbtable.all().forEach((set) => {
      this.delete(set.ID);
    });
  }

  /**
   * @param key insert your key
   * @param func insert your function (value)=>value === "<ur value>"
   */
  remove(key, func) {
    const data = this.get(key);
    const criteria = _.isFunction(func) ? func : (value) => func === value;
    const index = data.findIndex(criteria);
    if (index > -1) {
      data.splice(index, 1);
    }
    return this.set(key, data);
  }

  /**
   *
   * @param {String} key  insert your key
   * @param {String} value  insert your value

   * @returns
   */
  add(key, value) {
    let setValue = this.get(key);
    if (this.Cache) this.cache.set(key, setValue + value, {});
    this.dbtable.add(key, value, {});
  }

  /**
   *
   * @param {String} key  insert your key
   * @param {String} value  insert your value

   * @returns
   */
  subtract(key, value) {
    let setValue = this.get(key);
    if (this.Cache) this.cache.set(key, setValue - value, {});
    this.dbtable.subtract(key, value, {});
  }

  /**
   *

   * @returns
   */
  all() {
    var dbarr = this.dbtable.all({});
    const array = [];
    for (var i = 0; i < dbarr.length; i++) {
      array.push({
        ID: dbarr[i].ID,
        data: dbarr[i].data,
      });
    }
    return array;
  }

  /**
   *
   * @param {String} key  insert your key
   * @param {String} value  insert your value

   */
  push(key, value) {
    this.dbtable.push(key, value, {});
    let Push;
    if (this.Cache) Push === this.get(key);
    this.cache.set(key, Push);
  }
  /**
   * @param {String} key  insert your key
   * @param {String} value  insert your value

   */
  pull(key, value) {
    const array = this.dbtable.get(key, {});
    if (!Array.isArray(array)) throw new Error(pico.red(`${key} is not an array`));
    array.forEach((Value, Index) => {
      if (value === Value) {
        array.splice(Index, 1);
      }
    });
    return array;
  }

  /**
   * @param {String} key  insert your key

   */
  sort(key) {
    const array = this.dbtable.get(key, {});
    if (!Array.isArray(array)) throw new Error(pico.red(`${key} is not an array`));
    array.sort((a, b) => (a > b ? 1 : -1));
    return array;
  }

  /**
   * @param {String} key  insert your key

   */
  reverse(key) {
    const array = this.dbtable.get(key, {});
    if (!Array.isArray(array)) throw new Error(pico.red(`${key} is not an array`));
    array.reverse();
    return array;
  }

  /**
   * @return clears the cache
   */
  ClearCache() {
    if (this.Cache) this.cache.clear();
    if (this.verbose && !this.Cache) console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Did not set caching!`)}`);
  }

  /**
   * reCache the cache (Debugging)
   * not recomended for repeated looping
   */
  reCache() {
    if (this.verbose && !this.Cache) return console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Did not set caching!`)}`);

    const needCache = this.dbtable.all();
    needCache.forEach(async (value, key) => {
      if (this.verbose)
        console.log(
          `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Caching:`)} ${JSON.stringify({
            ID: value.ID,
            value: value.data,
          })}`
        );
      this.cache.set(value.ID, value.data);
    });
    if (this.verbose) {
      console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.green(`reCaching Complete!`)}`);
    }
  }

  /**
   * @returns the total cache size
   */
  cacheSize() {
    if (this.verbose && !this.Cache) {
      return `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Did not set caching!`)}`;
    } else if (this.Cache) return this.cache.size;
  }

  /**
   *
   * @param {String|Optional} name name of your backup file
   */
  async backup(options = {}) {
    if (!options.name) options.name === `backup-${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
    if (!options.path) options.path === "./";

    if (options.path.slice(-1) !== "/") options.path += "/";

    options.name = options.name.split(" ").join("-");

    if (options.name.includes("/" || "\\" || "?" || "*" || '"' || ":" || "<" || ">"))
      throw TypeError(`
        ${pico.red(`Backup database names cannot include there special characters: `)}/\\?*":<>`);

    const dbName = options.path + options.name;

    if (this.verbose) {
      await this.dbtable.backup(dbName);
      return console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.green(`Backedup your Database as:`)} ${dbName}.sqlite`);
    } else await this.dbtable.backup(dbName);
  }

  /**
   * Closes the Database and you cannot store keys and values in the database unless you restart your process
   */
  close() {
    this.dbtable.close();
    if (this.verbose) console.log(`${pico.magenta(`[VERBOSE]`)} ${pico.green(`Successfully closed`)} ${JSON.stringify(this.dbtable)}`);
  }

  /**
   * @param array array of keys and values in objects
   * [{key: "KEY-1", value: "VALUE-1"}, {key: "KEY-2", value: "VALUE-2"}, {key: "KEY-3", value: "VALUE-3"}]
   */
  setMany(keys) {
    if (typeof keys !== "object") throw TypeError(`${pico.red(`Must be an array`)}`);
    for (let i = 0; i < keys.length; i++) {
      if (typeof keys[i].key === undefined || null) break;
      if (typeof keys[i].value === undefined || null) break;
      if (keys[i].key === "") break;
      if (keys[i].value === "") break;
      this.set(keys[i].key, keys[i].value);
    }
  }
};
