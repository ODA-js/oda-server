import { Entity, ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import { memoizeEntityMapper } from '../../queries';

export const template = 'entity/type/enums.graphql.njs';

export function generate(
  te: Factory,
  entity: Entity,
  pack: ModelPackage,
  role: string,
  allowAcl,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(entity, pack, role, allowAcl, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  fields: string[];
}

import { getOrderBy } from '../../queries';

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  allowAcl,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: entity.name,
    fields: getOrderBy(role)(allowAcl, entity),
  };
}
