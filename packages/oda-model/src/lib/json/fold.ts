import set from './set';

export type simpleTypes = number | string | object | null | undefined;
export type possibleTypes = (objTree | simpleTypes) | (objTree | simpleTypes)[];
export type objTree = {
  [key: string]: possibleTypes;
};

const fold = (data: possibleTypes) => {
  let result = data;
  if (Array.isArray(data)) {
    result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      (result as any[]).push(fold(data[i]));
    }
  } else if (data && typeof data === 'object') {
    result = {};
    let keys = Object.keys(data);
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      let d = (data as objTree)[key];
      set(result, key, typeof data === 'object' ? fold(d) : d);
    }
  }
  return result;
};

export default fold;
