import set from './set';

const fold = (data: any) => {
  let result = data;
  if (Array.isArray(data)) {
    result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      result.push(fold(data[i]));
    }
    return result;
  } else if (data instanceof Object) {
    result = {};
    let keys = Object.keys(data);
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      let d = data[key];
      set(result, key, d instanceof Object ? fold(d) : d);
    }
  }
  return result;
};

export default fold;
