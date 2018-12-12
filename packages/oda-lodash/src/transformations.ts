import { every } from 'lodash';
import { some } from 'lodash';
import { startsWith } from 'lodash';
import { endsWith } from 'lodash';
import { lt } from 'lodash';
import { lte } from 'lodash';
import { gt } from 'lodash';
import { gte } from 'lodash';
import { eq } from 'lodash';
import { map } from 'lodash';
import { keyBy } from 'lodash';
import { chunk } from 'lodash';
import { drop } from 'lodash';
import { dropRight } from 'lodash';
import { take } from 'lodash';
import { takeRight } from 'lodash';
import { flattenDepth } from 'lodash';
import { fromPairs } from 'lodash';
import { nth } from 'lodash';
import { reverse } from 'lodash';
import { uniq } from 'lodash';
import { uniqBy } from 'lodash';
import { countBy } from 'lodash';
import { filter } from 'lodash';
import { reject } from 'lodash';
import { groupBy } from 'lodash';
import { sortBy } from 'lodash';
import { minBy } from 'lodash';
import { maxBy } from 'lodash';
import { meanBy } from 'lodash';
import { sumBy } from 'lodash';
import { join } from 'lodash';

import { get } from 'lodash';
import { set } from 'lodash';
import { unset } from 'lodash';
import { assign } from 'lodash';
import { mapValues } from 'lodash';
import { at } from 'lodash';
import { toPairs } from 'lodash';
import { invert } from 'lodash';
import { invertBy } from 'lodash';
import { keys } from 'lodash';
import { values } from 'lodash';
import { omit } from 'lodash';
import { has } from 'lodash';

// function getType(v: any): String {
//   const res = Object.prototype.toString.call(v).match(/\[object (.+)\]/);
//   return res && res.length > 0 ? res[1].toLowerCase() : 'unknown';
// }

const transformations = {
  array: {
    each: (array: any[], arg: any) => {
      return map(array, item => applyTransformations(item, arg));
    },
    map,
    keyBy,
    chunk,
    drop,
    dropRight,
    take,
    takeRight,
    flattenDepth,
    fromPairs,
    nth,
    reverse,
    uniq,
    uniqBy,
    countBy,
    filter,
    reject,
    filterIf: (array: any, arg: any) => {
      return filter(array, item => applyTransformations(item, arg));
    },
    rejectIf: (array: any, arg: any) => {
      return reject(array, item => applyTransformations(item, arg));
    },
    groupBy,
    sortBy,
    minBy,
    maxBy,
    meanBy,
    sumBy,
    join,
  },
  object: {
    get,
    assign: (src: any, args: any) =>
      (Array.isArray(args) ? args : [args]).reduce((obj, path) => {
        const source = get(obj, path);
        if (source && typeof source === 'object') {
          return omit(assign(obj, get(obj, path)), path);
        } else {
          return obj;
        }
      }, src),
    mapValues,
    at,
    toPairs,
    invert,
    invertBy,
    keys,
    values,
    has,
  },
  number: {
    lt,
    lte,
    gt,
    gte,
    eq,
  },
  string: {
    startsWith,
    endsWith,
    match: (src: string, args: any) => {
      return src.match(new RegExp(args.match, args.flags));
    },
    isMatch: (src: string, args: any) => {
      return new RegExp(args.match, args.flags).test(src);
    },
    toJSON: (str: string) => {
      return JSON.parse(str);
    },
  },
  '*': {
    stringify: (src: any) => {
      return JSON.stringify(src);
    },
    trim: (src: string | any) => {
      if (typeof src === 'string') {
        return src.trim();
      } else {
        if (typeof src === 'function') {
          return (...args: any[]) => {
            const result = src(...args);
            if (typeof result === 'string') {
              return result.trim();
            } else {
              return result;
            }
          };
        } else {
          return src;
        }
      }
    },
    convert: (obj: any, type: string) => {
      if (obj !== null || obj !== undefined) {
        switch (type) {
          case 'toNumber':
            return parseFloat(obj);
          case 'toString':
            return obj.toString();
          default:
        }
      } else {
        switch (type) {
          case 'toNumber':
            return NaN;
          case 'toString':
            return '';
          default:
        }
      }
    },
    dive: (src: any, args: any) => (obj: any, key: any) => {
      unset(obj, key);
      set(obj, args, src);
    },
  },
};

const opToExpectedType = (trans => {
  let result = {};
  for (const type in trans) {
    if (has(trans, type)) {
      const names = get(trans, type);
      for (const name in names) {
        if (has(names, name)) {
          set(result, name, type);
        }
      }
    }
  }
  return result;
})(transformations);

export function applyTransformations(object: any, args: any) {
  if (!args || object === null || object === undefined) {
    return object;
  }

  for (const op in args) {
    if (args.hasOwnProperty(op)) {
      // if (object === null)
      //   break;

      const arg = args[op];

      if (op === 'and') {
        object = every(arg, predicateArgs =>
          applyTransformations(object, predicateArgs),
        );
        continue;
      }
      if (op === 'or') {
        object = some(arg, predicateArgs =>
          applyTransformations(object, predicateArgs),
        );
        continue;
      }

      const expectedType = get(opToExpectedType, op);

      // if (!(object === undefined || object === null)) {
      //   let type = getType(object);
      //   if (
      //     expectedType !== '*' &&
      //     expectedType !== type &&
      //     type !== undefined
      //   ) {
      //     throw Error(
      //       `"${op}" transformation expect "${expectedType}" but got "${type}"`,
      //     );
      //   }
      // }

      object = get(transformations, [expectedType, op].join('.'))(object, arg);
      // if (object === null || object === undefined) return object;
    }
  }
  return object === undefined ? null : object;
}
