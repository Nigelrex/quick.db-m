<div align="center">
<img src="./logo.png" align="center">
<br>
<strong>A wrapper around of quick.db but with the superpowers of <i>Map</i> and many new features.</strong>
<br>
<br>
<img src="https://img.shields.io/github/stars/nigelrex/quick.db-map?color=red&label=Repo%20Stars&style=for-the-badge" /> 
<br>
</div>

### Table of Contents

- [Installation](#installation)
- [Credits](#credits)
- [Changelog](#changelog)

### Latest Version:

quick.db-map@1.0.10

## Credits

> [quick.db](https://npmjs.com/package/quick.db) Install this too in your dependencies

> [quick.db Website](https://quickdb.js.org) For vanilla documentation

> [quick.db Discord server](https://discord.gg/plexidev) Join it seriously

## Installation

_If you're having trouble installing, please follow [this troubleshooting guide](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md)._

### Linux & Windows

- `npm i quick.db quick.db-map`

**Note:** Windows users may need to do additional steps [listed here](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md).

### Mac

1. **Install:** XCode
2. **Run:** `npm i -g node-gyp` in terminal
3. **Run:** `node-gyp --python /path/to/python2.7` (skip this step if you didn't install python 3.x)
4. **Run:** `npm i quick.db quick.db-map`

#

Cached database usage

```js
const Database = require("quick.db-map");
//NOTE: table name is not a required parameter, if nothing is provided it does not create a table, and uses the default plain db
const db = new Database({ tableName: "abc", cache: true, clearCache: true }); //clearCache is a boolean and it will clear the cache every 5 minutes by default
//dbPath is a optional parameter, if nothing is provided it will use the default storage location
db.set("a", "b");
console.log(db.get("a")); //returns b
```

Clear cache at intervals (Other Options)

```js
const Database = require("quick.db-map");
const db = new Database({
  tableName: "abc",
  cache: true,
  clearCache: true,
  maxCacheLimit: 250,
  clearCacheInterval: "30s 10m 5h 2d 3w",
  verbose: true,
}); //maxCacheLimit is the maximum amount of cache that can be stored, clearCacheInterval will override the default 5 minutes interval <30s 10m 5h 2d 3w> [30seconds, 10minutes, 5hours, 2days, 3weeks]

//setting verbose to true will log the events happening
db.set("a", "b");
console.log(db.get("a")); //returns b
```

All Functions

```js
const Database = require("quick.db-map");
const db = new Database({
  dbPath: "./Databases/mydatabasename.db",
  tableName: "abc",
  cache: true,
  clearCache: true,
  maxCacheLimit: 1,
  clearCacheInterval: "4s",
  expiryInterval: "20s",
  verbose: true,
});

db.set("a", "b"); //sets b in value a
//Objects and Arrays also work!

db.get("a"); //returns b

db.has("a"); //returns true

db.delete("a"); //deletes a

db.has("a"); //returns false

db.set("a", { a: "b" }); //sets b in value a in the object

db.set("a.b", "abc"); //sets this as an object

db.deleteAll(); //WARNING! clears the entire database

db.ClearCache(); //Clears the database

db.cacheSize(); //returns the size of the cache

db.set("arandomnumber", 1);

db.add("arandomnumber", 20); //adds 1+20 to the value of arandomnumber and returns 21

db.subtract("arandomnumber", 10); //subtracts 10 from the value of arandomnumber and returns 11

db.set("an Array", [1, 2, 3, "b r u h meme", 6, 8, 2, 5, 7, 3, "meme bro?"]); //set a value as a array

db.push("an Array", 4); //adds 4 to the array and returns [1, 2, 3, 4]

db.reCache(); //re-caches the entire database into the cache

db.backup({ name: "MY DATABASE", path: "./" }); //backup the database

db.expiry("a", { m: 2 }); // expiry goes like this as Object only "{ y:2010, M:3, d:5, h:15, m:10, s:3, ms:12}" or "{ years:2010, months:3, days:5, hours:15, minutes:10, s:3, miliseconds:123}" and deletes "a" after 2 months

console.log(db.pull("an Array", "b r u h meme")); // removes "b r u h meme" from the array

console.log(db.sort("an Array")); // sorts the array and returns "Strings" in the first and then the "Numbers"

console.log(db.reverse("an Array")); // reverses the array

console.log(db.remove("an Array", (value) => value === "b r u h meme")); // removes "b r u h meme" from the array

db.setMany([
  { key: "KEY-1", value: "VALUE-1" },
  { key: "KEY-2", value: "VALUE-2" },
  { key: "KEY-3", value: "VALUE-3" },
]);
```

#

## Changelog

> Added Pull, sort and reverse All Array related features
