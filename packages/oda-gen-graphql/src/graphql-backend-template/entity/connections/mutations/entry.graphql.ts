import { Entity, ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import {
  persistentRelations,
  getFieldsForAcl,
  memoizeEntityMapper,
} from '../../../queries';
export const template = 'entity/connections/mutations/entry.graphql.njs';
export function generate(
  te: Factory,
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(entity, pack, role, aclAllow, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  connections: {
    relationName: string;
  }[];
}

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: entity.name,
    connections: getFieldsForAcl(role, pack)(aclAllow, entity)
      .filter(persistentRelations(pack))
      .map(f => ({
        relationName: f.relation.fullName,
      })),
  };
}
