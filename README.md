# quick.db-map

A superset of quick.db but with the superpowers of Map

Thanks to [quick.db](https://npmjs.com/package/quick.db) now your database it 8ms faster than normal!

## Installation

_If you're having troubles installing, please follow [this troubleshooting guide](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md)._

**Linux & Windows**

- `npm i quick.db quick.db-map`

**\*Note:** Windows users may need to do additional steps [listed here](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md).\*
**Mac**

1. **Install:** XCode
2. **Run:** `npm i -g node-gyp` in terminal
3. **Run:** `node-gyp --python /path/to/python2.7` (skip this step if you didn't install python 3.x)
4. **Run:** `npm i quick.db quick.db-map`

## How to run it?

```js
const Database = require("quick.db-map");
const db = new Database({ tableName: "abc", inMemory: true }); //inMemory is a boolean so you can choose if your database has to be cached
db.set("a", "b");
console.log(db.get("a")); //returns b
```

## Credits:

> [quick.db](https://npmjs.com/package/quick.db) Install this too in your dependency

> [quick.db website](https://quickdb.js.org) for vanilla documentation

> [quick.db discord server](https://discord.gg/plexidev) Join it seriously

## Support

I work on these projects in my spare time, if you'd like to support me, you can do so via [Patreon! ❤️](https://www.patreon.com/lorencerri) Support quick.db!
