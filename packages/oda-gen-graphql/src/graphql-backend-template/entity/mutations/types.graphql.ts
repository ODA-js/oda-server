import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { printRequired, decapitalize, capitalize } from './../../utils';

import { Factory } from 'fte.js';

export const template = 'entity/mutations/types.graphql.njs';

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
  plural: string;
  payloadName: string;
  relations: {
    derived: boolean;
    persistent: boolean;
    field: string;
    embedded: boolean;
    single: boolean;
    fields: any[];
    ref: {
      entity: string;
      eEntity: MapperOutput;
    };
  }[];
  create: {
    name: string;
    type: string;
  }[];
  update: {
    name: string;
    type: string;
  }[];
  unique: {
    name: string;
    type: string;
  }[];
}

import {
  getFieldsForAcl,
  identityFields,
  mutableFields,
  relationFieldsExistsIn,
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
  let fieldsAcl = getFieldsForAcl(role, pack)(aclAllow, entity);
  let ids = getFields(entity).filter(idField);
  const mapToGQLTypes = typeMapper.graphql;
  const mapToGQLInputTypes = typeMapper.graphqlInput;

  return {
    name: entity.name,
    plural: entity.plural,
    payloadName: decapitalize(entity.name),
    relations: fieldsAcl.filter(relationFieldsExistsIn(pack)).map(f => {
      let verb = f.relation.verb;
      let fields = [];

      if (
        verb === 'BelongsToMany' &&
        f.relation.fields &&
        f.relation.fields.size > 0
      ) {
        f.relation.fields.forEach(field => {
          fields.push({ name: field.name, type: mapToGQLTypes(field.type) });
        });
      }
      let refEntity;
      if (fields.length > 0) {
        refEntity = mapper(
          pack.get(f.relation.ref.entity),
          pack,
          role,
          aclAllow,
          typeMapper,
        );
      }
      return {
        persistent: f.persistent,
        derived: f.derived,
        field: f.name,
        embedded: f.relation.embedded,
        single: verb === 'BelongsTo' || verb === 'HasOne',
        fields,
        cField: capitalize(f.name),
        ref: {
          entity: f.relation.ref.entity,
          eEntity: refEntity,
        },
      };
    }),
    create: [
      ...ids.map(f => ({
        name: f.name,
        type: 'ID',
        required: false,
      })),
      ...fieldsAcl.filter(mutableFields),
    ].map(f => ({
      name: f.name,
      type: `${mapToGQLTypes(f.type)}${printRequired(f)}`,
    })),
    update: [
      ...ids.map(f => ({
        name: f.name,
        type: 'ID',
        required: false,
      })),
      ...fieldsAcl.filter(mutableFields),
    ].map(f => ({
      name: f.name,
      type: `${mapToGQLTypes(f.type)}`,
    })),
    unique: [
      ...[
        ...ids.map(f => ({
          name: f.name,
          type: 'ID',
        })),
        ...fieldsAcl.filter(identityFields),
      ].map(f => ({
        name: f.name,
        type: mapToGQLTypes(f.type),
      })),
    ],
  };
}
