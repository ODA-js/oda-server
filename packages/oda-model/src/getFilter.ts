import { FieldMap } from './metamodel';
import { INamed } from './types';
/**
 * returns filter function for
 * @param inp filter
 */
export function getFilter<T extends INamed>(
  inp: string,
): {
  filter: (f: T) => boolean;
  fields: string[];
} {
  let result = {
    filter: (f: T) => f.name === inp,
    fields: [inp],
  };
  if (inp === '*') {
    result.filter = () => true;
  }
  if (inp.startsWith('^[')) {
    let notFields = inp
      .slice(2, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce(
        (res, cur) => {
          res[cur] = true;
          return res;
        },
        {} as FieldMap,
      );
    result.filter = (f: T) => !notFields[f.name];
    result.fields = [];
  }
  if (inp.startsWith('[')) {
    let onlyFields = inp
      .slice(1, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce(
        (res, cur) => {
          res[cur] = true;
          return res;
        },
        {} as FieldMap,
      );
    result.filter = (f: T) => !!onlyFields[f.name];
    result.fields = Object.keys(onlyFields);
  }
  return result;
}

export function filter(inp: string): (f: string) => boolean {
  let result = (f: string) => f === inp;

  if (inp === '*') {
    result = () => true;
  }
  if (inp.startsWith('^[')) {
    let notFields = inp
      .slice(2, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce(
        (res, cur) => {
          res[cur] = true;
          return res;
        },
        {} as FieldMap,
      );
    result = (f: string) => !notFields[f];
  }
  if (inp.startsWith('[')) {
    let onlyFields = inp
      .slice(1, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce(
        (res, cur) => {
          res[cur] = true;
          return res;
        },
        {} as FieldMap,
      );
    result = (f: string) => !!onlyFields[f];
  }
  return result;
}
