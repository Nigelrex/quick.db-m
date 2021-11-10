/**
 * quick.db-map definitions
 */
declare module "quick.db-map" {
  export interface Options {
    target?: string | null;
    table?: string;
  }

  export type ValueData =
    | string
    | object
    | number
    | null
    | boolean
    | bigint
    | symbol
    | any[];

  /**
   * Package version. Community requested feature.
   * ```
   * console.log(require('quick.db-map').version);
   * ```
   */
  const version: string;

  /**
   * This function fetches data from a key in the database.
   * @param key Any string as a key. Also allows for dot notation following the key.
   * @param ops Any options to be added to the request.
   */
  function fetch(key: string, ops?: Options): any;

  /**
   * This function fetches data from a key in the database.
   * @param key Any string as a key. Also allows for dot notation following the key.
   * @param ops Any options to be added to the request.
   */
  function get(key: string, ops?: Options): any;

  /**
   * This function sets new data based on a key in the database.
   * @param key Any string as a key. Also allows for dot notation following the key.
   * @param value Value to set.
   * @param ops Any options to be added to the request.
   */
  function set(key: string, value: ValueData, ops?: Options): any;

  /**
   * This function adds a number to a key in the database. (If no existing number, it will add to 0)
   * @param key Any string as a key. Also allows for dot notation following the key.
   * @param value Any numerical value.
   * @param ops Any options to be added to the request.
   */
  function add(key: string, value: number, ops?: Options): any;

  /**
   * This function subtracts a number to a key in the database. (If no existing number, it will subtract from 0)
   * @param key Any string as a key. Also allows for dot notation following the key.
   * @param value Any numerical value.
   * @param ops Any options to be added to the request.
   */
  function subtract(key: string, value: number, ops?: Options): any;

  /**
   * This function will push into an array in the database based on the key. (If no existing array, it will create one)
   * @param key Any string as a key. Also allows for dot notation following the key.
   * @param value Any data to push.
   * @param ops Any options to be added to the request.
   */
  function push(key: string, value: ValueData, ops?: Options): any[];

  /**
   * This function returns a boolean indicating whether an element with the specified key exists or not.
   * @param key Any string as a key. Also allows for dot notation following the key, this will return if the prop exists or not.
   * @param ops Any options to be added to the request.
   */
  function has(key: string, ops?: Options): boolean;

  /**
   * This function returns a boolean indicating whether an element with the specified key exists or not.
   * @param key Any string as a key. Also allows for dot notation following the key, this will return if the prop exists or not.
   * @param ops Any options to be added to the request.
   */
  function includes(key: string, ops?: Options): boolean;

  /**
   * This function fetches the entire active table
   * @param ops Any options to be added to the request.
   */
  function all(ops?: Options): { ID: string; data: any }[];

  /**
   * This function fetches the entire active table
   * @param ops Any options to be added to the request.
   */
  function fetchAll(ops?: Options): { ID: string; data: any }[];

  /**
   * This function will delete an object (or property) in the database.
   * @param key Any string as a key. Also allows for dot notation following the key, this will delete the prop in the object.
   * @param ops Any options to be added to the request.
   */
  function del(key: string, ops?: Options): boolean;

  /**
   *
   * @param name custom name for you backup file
   */
  function backup(name?: string): boolean;

  /**
   * Used to get the type of the value.
   * @param key Any string as a key. Also allows for dot notation following the key, this will delete the prop in the object.
   * @param ops Any options to be added to the request.
   */
  function dataType(
    key: string,
    ops?: Options,
  ):
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function";

  export {
    fetch,
    get,
    set,
    add,
    subtract,
    push,
    has,
    includes,
    all,
    fetchAll,
    backup,
    del as delete,
    dataType as type,
    version,
  };
}
