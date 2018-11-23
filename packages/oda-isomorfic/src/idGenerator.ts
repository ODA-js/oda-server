declare var window: any;

import * as md5Hex from 'md5-hex';
import { toGlobalId, fromGlobalId } from './globalIds';

function decimalToHex(d: string | number, padding: number) {
  let hex = Number(d).toString(16);
  padding =
    typeof padding === 'undefined' || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = '0' + hex;
  }
  return hex;
}

export class IdGenerator {
  private static browser = !global.hasOwnProperty('process');
  private static counter: number = 0;
  public static generateMongoId() {
    return (
      Math.trunc(Date.now() / 1000)
        .toString(16)
        .slice(0, 8) +
      md5Hex(
        this.browser
          ? window.location.href
          : (process.title + process.version).toString(),
      ).slice(0, 6) +
      decimalToHex(
        this.browser
          ? Math.floor(Math.random() * 100000 * Math.random())
          : process.pid,
        4,
      ).slice(0, 4) +
      decimalToHex(this.counter++, 6).slice(0, 6)
    );
  }

  public static generateIdFor(typeName: string) {
    return toGlobalId(typeName, this.generateMongoId());
  }

  public static getIdForFromKey(typeName: string, key: string) {
    return toGlobalId(typeName, key);
  }

  public static generateIdForWithId(typeName: string, id: string) {
    return toGlobalId(typeName, id);
  }

  public static reverse(id: string) {
    return fromGlobalId(id);
  }
}
