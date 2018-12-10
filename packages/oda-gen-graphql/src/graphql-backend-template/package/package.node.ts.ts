import { ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';

export const template = 'package/package.node.ts.njs';

export function generate(
  te: Factory,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(pack, typeMapper), template);
}

export interface MapperOutput {
  entities: { name: string }[];
}

import { getRealEntities } from '../queries';

export function mapper(
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    entities: getRealEntities(pack).map(e => ({
      name: e.name,
    })),
  };
}
