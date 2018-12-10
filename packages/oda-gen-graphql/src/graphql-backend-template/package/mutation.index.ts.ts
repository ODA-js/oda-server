import { ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import { decapitalize, capitalize } from '../utils';

export const template = 'package/mutation.index.ts.njs';

export function generate(
  te: Factory,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(pack, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  mutations: {
    name: string;
    entry: string;
  }[];
}

import { getMutations } from '../queries';

export function mapper(
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: capitalize(pack.name),
    mutations: getMutations(pack).map(e => ({
      name: e.name,
      entry: capitalize(e.name),
    })),
  };
}
