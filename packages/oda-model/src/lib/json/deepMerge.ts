import { isEqual } from 'lodash';

import get from './get';
import set from './set';

export function find(array: any[], item: any) {
  let result = array.indexOf(item);
  if (result === -1 && typeof item === 'object') {
    array.some((f, i) => {
      const res = isEqual(f, item);
      if (res) {
        result = i;
      }
      return res;
    });
  }
  return result;
}

export function arrayItemOperation(inp: any): any {
  if (typeof inp === 'string') {
    if (inp.startsWith('-')) {
      return {
        $unset: arrayItemOperation(inp.slice(1, inp.length)),
      };
    } else if (inp.startsWith('[') && inp.endsWith(']')) {
      return inp
        .slice(1, inp.length - 1)
        .split(',')
        .map(f => f.trim())
        .filter(f => f && f !== 'undefined' && f !== 'null')
        .map(arrayItemOperation);
    } else if (inp.startsWith('=')) {
      return {
        $assign: arrayItemOperation(inp.slice(1, inp.length)),
      };
    } else {
      return inp;
    }
  } else {
    if (Array.isArray(inp)) {
      const res: any[] = [];
      let changed = false;
      inp.forEach(item => {
        const ret = arrayItemOperation(item);
        res.push(ret);
        changed = !(!changed && ret === item);
      });
      return changed ? res : inp;
    } else {
      return inp;
    }
  }
}

function pushUnique(result: any[], current: any) {
  if (Array.isArray(current)) {
    current.forEach(item => {
      pushUnique(result, item);
    });
  } else {
    if (find(result, current) === -1) {
      result.push(current);
    }
  }
}

function removeIfExists(result, current: any) {
  if (Array.isArray(current)) {
    current.forEach(item => {
      removeIfExists(result, item);
    });
  } else {
    const index = find(result, current);
    if (index !== -1) {
      result.splice(index, 1);
    }
  }
}

function processArrayItem(result: any[], value: any) {
  const item = arrayItemOperation(value);
  if (typeof item === 'object' && item.hasOwnProperty('$unset')) {
    removeIfExists(result, item.$unset);
  } else if (typeof item === 'object' && item.hasOwnProperty('$assign')) {
    result.length = 0;
    if (!Array.isArray(item.$assign)) {
      item.$assign = [item.$assign];
    }
    result.push(...item.$assign);
  } else {
    pushUnique(result, item);
  }
}

export function processArray(result: any[], current: any) {
  if (Array.isArray(current)) {
    current.forEach(item => {
      processArrayItem(result, item);
    });
  } else {
    processArrayItem(result, current);
  }
}

export default function deepMerge(...args: object[]) {
  if (args.length > 0) {
    // дописать merge с массивами
    let result = new (<any>args[0].constructor)();
    for (let i = 0, len = args.length; i < len; i++) {
      let current = args[i];
      if (current !== undefined) {
        if (!Array.isArray(result)) {
          let keys = Object.keys(current);
          for (let j = 0, kLen = keys.length; j < kLen; j++) {
            let key = keys[j];
            if (current.hasOwnProperty(key)) {
              let cv = get(current, key);
              let rv = get(result, key);
              if (
                result.hasOwnProperty(key) &&
                (typeof rv === 'object' && rv !== null)
              ) {
                set(result, key, deepMerge(rv, cv));
              } else {
                set(result, key, cv);
              }
            }
          }
        } else {
          processArray(result, current);
        }
      }
    }
    return result;
  } else {
    return args[0];
  }
}
