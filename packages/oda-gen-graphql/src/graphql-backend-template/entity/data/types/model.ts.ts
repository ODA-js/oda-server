import { Entity, ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';

export const template = 'entity/data/types/model.ts.njs';

export function generate(
  te: Factory,
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  defaultAdapter?: string,
) {
  return te.run(
    mapper(entity, pack, role, aclAllow, typeMapper, defaultAdapter),
    template,
  );
}

export interface MapperOutput {
  name: string;
  plural: string;
  description: string;
  embedded: string[];
  fields: {
    name: string;
    type: string;
  }[];
}

import {
  getFields,
  relationFieldsExistsIn,
  mutableFields,
  idField,
  memoizeEntityMapper,
} from '../../../queries';

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter?: string,
): MapperOutput {
  const mapToTSTypes = typeMapper.typescript;
  const relations = relationFieldsExistsIn(pack);
  let ids = getFields(entity).filter(idField);
  let embedded = getFields(entity).filter(
    f => f.relation && f.relation.embedded,
  );
  return {
    name: entity.name,
    plural: entity.plural,
    description: entity.description,
    embedded: Object.keys(
      embedded
        .map(f => f.relation.ref.entity)
        .reduce((res, i) => {
          res[i] = 1;
          return res;
        }, {}),
    ),
    fields: [
      ...ids,
      ...getFields(entity).filter(f => relations(f) || mutableFields(f)),
    ].map(f => {
      return {
        name: f.name,
        type: `${
          f.relation && f.relation.embedded
            ? 'I' + f.relation.ref.entity
            : mapToTSTypes(f.type)
        }${f.relation && !f.relation.single ? '[]' : ''}`,
        required: f.required,
      };
    }),
  };
}
