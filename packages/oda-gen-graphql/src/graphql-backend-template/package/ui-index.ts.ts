import { ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import { decapitalize, capitalize } from '../utils';

export const template = 'entity/UI/ui-index.ts.njs';

export function generate(
  te: Factory,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(pack, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  role: string;
  entities: {
    name: string;
    entry: string;
    embedded: boolean | string[];
    abstract: boolean;
  }[];
  enums: { name: string }[];
}

import { getUIEntities, getEnums } from '../queries';

export function mapper(
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: capitalize(pack.name),
    role: pack.name,
    entities: getUIEntities(pack).map(e => ({
      name: e.name,
      entry: decapitalize(e.name),
      embedded: e.embedded,
      abstract: e.abstract,
    })),
    enums: getEnums(pack).map(p => ({
      name: p.name,
    })),
  };
}
