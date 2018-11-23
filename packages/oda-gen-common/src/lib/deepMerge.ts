import { mergeWith, isArray } from 'lodash';

function mergeAll(srcValue, dstValue) {
  if (isArray(dstValue)) {
    if (srcValue !== undefined && srcValue !== null) {
      return dstValue.concat(srcValue);
    }
  }
  if (dstValue === null) {
    return dstValue;
  }
}

export default function deepMerge(...args: Object[]) {
  if (args.length > 2) {
    return deepMerge(args[0], deepMerge(...args.slice(1)));
  } else if (args.length === 2) {
    return _deepMerge(args[0], args[1]);
  } else if (args.length === 1) {
    return args[0];
  }
}

function _deepMerge(src, dst) {
  return mergeWith(dst, src, mergeAll);
}
