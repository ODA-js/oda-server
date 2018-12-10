import { Entity, ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import { lib } from 'oda-gen-common';
let get = lib.get;

export const template = {
  mongoose: 'entity/data/mongoose/schema.ts.njs',
  sequelize: 'entity/data/sequelize/schema.ts.njs',
};

export function generate(
  te: Factory,
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter?: string,
) {
  return te.run(
    mapper(entity, pack, role, aclAllow, typeMapper, adapter),
    template[adapter],
  );
}

export interface MapperOutput {
  name: string;
  plural?: string;
  strict: boolean | undefined;
  collectionName: string;
  description?: string;
  useDefaultPK: boolean;
  fields: {
    name: string;
    type: string;
    required?: boolean;
  }[];
  embedded: string[];
  relations: {
    name: string;
    type: string;
    single: boolean;
    embedded?: boolean | string;
    required?: boolean;
    primaryKey?: boolean;
  }[];
  indexes?:
    | {
        fields: object;
        options: object;
      }[]
    | object;
}

import {
  getFields,
  mutableFields,
  singleStoredRelationsExistingIn,
  indexes,
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
  adapter: string,
): MapperOutput {
  let ids = getFields(entity)
    .filter(idField)
    .filter(f => f.type !== 'ID');
  let useDefaultPK = ids.length === 0;
  let embedded = getFields(entity).filter(
    f => f.relation && f.relation.embedded,
  );
  return {
    name: entity.name,
    plural: entity.plural,
    strict: get(entity.metadata, 'persistence.schema.strict'),
    collectionName:
      get(entity.metadata, 'persistence.collectionName') ||
      entity.plural.toLowerCase(),
    description: entity.description,
    useDefaultPK,
    fields: [
      ...ids.map(f => ({
        name: f.name === 'id' && adapter === 'sequelize' ? f.name : '_id',
        type: adapter === 'sequelize' ? `${f.type}_pk` : f.type,
        required: true,
        defaultValue: f.defaultValue,
        primaryKey: true,
      })),
      ...getFields(entity).filter(mutableFields),
    ].map(f => {
      return {
        name: f.name,
        type: typeMapper[adapter](f.type),
        required: f.required,
        primaryKey: !!f['primaryKey'],
        defaultValue: f.defaultValue,
      };
    }),
    embedded: Object.keys(
      embedded
        .map(f => f.relation.ref.entity)
        .reduce((res, i) => {
          res[i] = 1;
          return res;
        }, {}),
    ),
    relations: [
      ...getFields(entity)
        .filter(singleStoredRelationsExistingIn(pack))
        .filter(r => r.relation.ref.backField !== r.name),
      ...embedded,
    ].map(f => {
      let retKeyType = pack.entities
        .get(f.relation.ref.entity)
        .fields.get(f.relation.ref.field).type;
      return {
        name: f.name,
        type: typeMapper[adapter](retKeyType),
        indexed: true,
        single: f.relation.single,
        embedded: f.relation.embedded ? f.relation.ref.entity : false,
        required: !!f.required,
      };
    }),
    indexes:
      adapter === 'sequelize'
        ? indexes(entity).map(i => ({
            fields: i.fields,
            options: i.options,
            name: i.name,
          }))
        : indexes(entity)
            .filter(i => i.name !== 'id')
            .map(i => ({
              fields: i.fields,
              options: i.options,
              name: i.name,
            })),
  };
}
