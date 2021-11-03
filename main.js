const quickdb = require("quick.db");
const ms = require("ms");
const pico = require("picocolors");
const fs = require("fs-extra");

/**
 * @extends {Map}
 * @extends {db}
 */
module.exports = class Database {
  /**
   * @param {Object} options - "List of all the options"
   *
   * @param {string|Optional} options.tableName - "The name of the table to create"
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
   * @param {Boolean|Optional} options.verbose - "If true prints the cache size and the cache size after clearing"
   *
   * @param {*} this.cache - "This is the cache where the values are stored in memory for fast processing of snippets"
   */

  constructor(options = {}) {
    this.table = options.tableName;
    this.dbPath = options.dbPath ?? "./json.sqlite";
    this.Cache = options.cache ?? false;
    this.clearCache = options.clearCache ?? false;
    this.maxCacheLimit = options.maxCacheLimit ?? 100;
    this.clearCacheInterval = ms(options.clearCacheInterval) ?? ms("5m");
    this.verbose = options.verbose ?? false;
    fs.ensureDir(this.dbPath.split(/\w+\.\w+/g.exec(this.dbPath).pop())[0]);
    const db = quickdb(this.dbPath);
    this.cache = new Map();
    this.dbtable = this.table ? new db.table(`${this.table}`) : db;

    // Error handling
    // Memory \\
    if (typeof this.Cache !== "boolean")
      throw new Error(pico.red(`inMemory is typeof "Boolean"`));

    if (typeof this.clearCache !== "boolean")
      throw new Error(pico.red(`clearCache is typeof "Boolean"`));

    if (typeof this.maxCacheLimit !== "number")
      throw new Error(pico.red(`maxCacheLimit is typeof "number"`));

    // Verbose \\
    if (typeof this.verbose !== "boolean")
      throw new Error(pico.red(`Verbose typeof Boolean`));

    if (this.verbose) {
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(
          `DataBase`
        )}: ${JSON.stringify(this.dbtable)}`
      );
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Cache:`)} ${this.Cache}`
      );
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`clearCache:`)} ${
          this.clearCache
        }`
      );
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`maxCacheLimit:`)} ${
          this.maxCacheLimit
        }`
      );
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`clearCacheInterval:`)} ${
          this.clearCacheInterval
        }ms`
      );
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`DataBase Path:`)} ${
          this.dbPath
        }`
      );

      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Verbose:`)} ${this.verbose}`
      );
    }

    //cache values that are in the sqlite file
    const needCache = this.dbtable.all();
    needCache.forEach(async (value, key) => {
      if (this.verbose) {
        console.log(
          `${pico.magenta(`[VERBOSE]`)} ${pico.blue(
            `Caching:`
          )} ${JSON.stringify({
            ID: value.ID,
            value: value.data,
          })}`
        );
      }
      this.cache.set(value.ID, value.data);
    });
    if (this.verbose)
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(
          `Current cache size: `
        )} ${this.cacheSize()}`
      );

    //This is used to clear the cache every 5 minutes (By default)
    if (
      this.Cache &&
      this.clearCache &&
      this.cache.size >= this.maxCacheLimit
    ) {
      setInterval(() => {
        if (this.verbose) {
          console.log(
            `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Clearing cache`)}`
          );
        }
        this.cache.clear();
        if (this.verbose)
          console.log(
            `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Current cache size:`)} ${
              this.cache.size
            }`
          );
      }, this.clearCacheInterval);
    }
  }

  /**
   *
   * @param {*} key  insert your key
   * @param {*} value  insert your value
   * @param {*} ops
   */
  set(key, value, ops) {
    if (this.Cache) this.cache.set(key, value, ops ?? {});
    this.dbtable.set(key, value, ops ?? {});
  }

  /**
   *
   * @param {*} key  insert your key
   * @param {*} ops
   * @returns
   */
  get(key, ops) {
    if (this.Cache && this.cache.has(key, ops ?? {}))
      return this.cache.get(key, ops ?? {});

    return this.dbtable.get(key, ops ?? {});
  }

  /**
   *
   * @param {*} key  insert your key
   * @param {*} ops
   * @returns
   */
  has(key, ops) {
    if (this.Cache && this.cache.has(key, ops ?? {}))
      return this.cache.has(key, ops ?? {});

    return this.dbtable.has(key, ops ?? {});
  }

  /**
   *
   * @param {*} key  insert your key
   * @param {*} ops
   */
  delete(key, ops) {
    if (this.Cache) this.cache.delete(key, ops ?? {});

    this.dbtable.delete(key, ops ?? {});
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
   *
   * @param {*} key  insert your key
   * @param {*} value  insert your value
   * @param {*} ops
   * @returns
   */
  add(key, value, ops) {
    let setValue = this.get(key, ops);
    if (this.Cache) this.cache.set(key, setValue + value, ops ?? {});
    this.dbtable.add(key, value, ops ?? {});
  }

  /**
   *
   * @param {*} key  insert your key
   * @param {*} value  insert your value
   * @param {*} ops
   * @returns
   */
  subtract(key, value, ops) {
    let setValue = this.get(key, ops);
    if (this.Cache) this.cache.set(key, setValue - value, ops ?? {});
    this.dbtable.subtract(key, value, ops ?? {});
  }

  /**
   *
   * @param {*} ops
   * @returns
   */
  all(ops) {
    var dbarr = this.dbtable.all(ops ?? {});
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
   * @param {*} key  insert your key
   * @param {*} value  insert your value
   * @param {*} ops
   */
  push(key, value, ops) {
    this.dbtable.push(key, value, ops ?? {});
    let Push;
    if (this.Cache) Push === this.get(key);
    this.cache.set(key, Push);
  }

  /**
   * @return clears the cache
   */
  ClearCache() {
    if (this.Cache) this.cache.clear();
    if (this.verbose && !this.Cache)
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Did not set caching!`)}`
      );
  }

  /**
   * reCache the cache (Debugging)
   * not recomended for repeated looping
   */
  reCache() {
    if (this.verbose && !this.Cache)
      return console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.blue(`Did not set caching!`)}`
      );

    const needCache = this.dbtable.all();
    needCache.forEach(async (value, key) => {
      if (this.verbose)
        console.log(
          `${pico.magenta(`[VERBOSE]`)} ${pico.blue(
            `Caching:`
          )} ${JSON.stringify({
            ID: value.ID,
            value: value.data,
          })}`
        );
      this.cache.set(value.ID, value.data);
    });
    if (this.verbose) {
      console.log(
        `${pico.magenta(`[VERBOSE]`)} ${pico.green(`reCaching Complete!`)}`
      );
    }
  }

  /**
   * @returns the total cache size
   */
  cacheSize() {
    if (this.verbose && !this.Cache) {
      return `${pico.magenta(`[VERBOSE]`)} ${pico.blue(
        `Did not set caching!`
      )}`;
    } else if (this.Cache) return this.cache.size;
  }
};
