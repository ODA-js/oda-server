import { ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import { decapitalize, capitalize } from '../utils';

export const template = 'package/type.index.ts.njs';

export function generate(
  te: Factory,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(pack, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  entities: {
    name: string;
    entry: string;
  }[];
}

import { getRealEntities } from '../queries';

export function mapper(
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: capitalize(pack.name),
    entities: getRealEntities(pack).map(e => ({
      name: e.name,
      entry: decapitalize(e.name),
    })),
  };
}
