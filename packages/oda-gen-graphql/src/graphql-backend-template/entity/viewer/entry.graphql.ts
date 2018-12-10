import { Entity, ModelPackage, FieldType } from 'oda-model';
import * as inflect from 'inflected';
import { Factory } from 'fte.js';

export const template = 'entity/viewer/entry.graphql.njs';

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
  plural: string;
  pluralEntry: string;
  singularEntry: string;
  unique: string;
}

import {
  getFieldsForAcl,
  identityFields,
  getFields,
  idField,
  memoizeEntityMapper,
} from '../../queries';

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  let ids = getFields(entity).filter(idField);
  const mapToGQLTypes = typeMapper.graphql;

  let unique = [
    ...ids.map(f => ({
      name: f.name,
      type: 'ID',
    })),
    ...getFieldsForAcl(role, pack)(aclAllow, entity).filter(identityFields),
  ]
    .map(f => ({
      name: f.name,
      type: mapToGQLTypes(f.type),
    }))
    .map(i => `${i.name}: ${i.type}`)
    .join(', ');

  return {
    name: entity.name,
    plural: entity.plural,
    singularEntry: inflect.camelize(entity.name, false),
    pluralEntry: inflect.camelize(entity.plural, false),
    unique,
  };
}
