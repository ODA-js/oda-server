import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { capitalize, decapitalize } from '../../utils';
import { Factory } from 'fte.js';

export const template = 'entity/mutations/resolver.ts.njs';

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
  ownerFieldName: string;
  // unique: {
  //   args: { name: string, type: string }[];
  //   find: { name: string, type: string, cName: string }[];
  //   complex: { name: string, fields: { name: string, uName: string, type: string }[] }[];
  // }
  complexUnique: {
    name: string;
    fields: { name: string; uName: string; type: string }[];
  }[];
  relEntities: any[];
  relations: {
    derived: boolean;
    persistent: boolean;
    field: string;
    single: boolean;
    name: string;
    fields: any[];
    ref: {
      entity: string;
      fieldName: string;
    };
  }[];
  fields: { name: string }[];
  persistent: {
    derived: boolean;
    persistent: boolean;
    field: string;
    single: boolean;
    name: string;
    ref: {
      entity: string;
      fieldName: string;
    };
  }[];
  args: {
    create: {
      args: { name: string; type: string }[];
      find: { name: string; type: string }[];
    };
    update: {
      args: { name: string; type: string }[];
      find: { name: string; type: string; cName: string }[];
      payload: { name: string; type: string }[];
    };
    remove: {
      args: { name: string; type: string }[];
      find: { name: string; type: string; cName: string }[];
    };
  };
}

// для каждой операции свои параметры с типами должны быть.
// специальный маппер типов для ts где ID === string

import {
  getFieldsForAcl,
  mutableFields,
  persistentFields,
  identityFields,
  relationFieldsExistsIn,
  oneUniqueInIndex,
  complexUniqueIndex,
  getFields,
  idField,
  relations as filterRels,
  memoizeEntityMapper,
  canUpdateBy,
} from '../../queries';

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  const relsInPackage = relationFieldsExistsIn(pack);
  let fieldsAcl = getFieldsForAcl(role, pack)(aclAllow, entity);
  let ids = getFields(entity).filter(idField);
  const mapToTSTypes = typeMapper.typescript;
  const mapToGQLTypes = typeMapper.graphql;

  const relations = fieldsAcl.filter(relsInPackage).map(f => {
    let verb = f.relation.verb;
    let sameEntity = entity.name === f.relation.ref.entity;
    let refFieldName = `${f.relation.ref.entity}${
      sameEntity ? capitalize(f.name) : ''
    }`;
    let fields = [];
    if (f.relation.fields && f.relation.fields.size > 0) {
      f.relation.fields.forEach(field => {
        fields.push({ name: field.name, type: mapToTSTypes(field.type) });
      });
    }
    return {
      persistent: f.persistent,
      derived: f.derived,
      field: f.name,
      name: f.relation.fullName,
      cField: capitalize(f.name),
      embedded: f.relation.embedded,
      single: verb === 'BelongsTo' || verb === 'HasOne',
      fields,
      ref: {
        entity: f.relation.ref.entity,
        fieldName: decapitalize(refFieldName),
      },
    };
  });

  const complexUnique = complexUniqueIndex(entity)
    .map(i => {
      let fields = Object.keys(i.fields)
        .map(fn => entity.fields.get(fn))
        .map(f => ({
          name: f.name,
          uName: capitalize(f.name),
          type: mapToTSTypes(f.type),
          gqlType: mapToGQLTypes(f.type),
        }))
        .sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          } else if (a.name < b.name) {
            return -1;
          } else {
            return 0;
          }
        });
      return {
        name: i.name,
        fields,
      };
    })
    .filter(
      f => !f.fields.some(fld => !canUpdateBy(entity.fields.get(fld.name))),
    );

  return {
    name: entity.name,
    ownerFieldName: decapitalize(entity.name),
    relEntities: fieldsAcl
      .filter(relationFieldsExistsIn(pack))
      .map(f => f.relation.ref.entity)
      .reduce((prev, curr) => {
        if (prev.indexOf(curr) === -1) {
          prev.push(curr);
        }
        return prev;
      }, [])
      .map(e => pack.get(e))
      .map(e => {
        let fieldsEntityAcl = getFieldsForAcl(role, pack)(aclAllow, e);
        return {
          name: e.name,
          findQuery: decapitalize(e.name),
          ownerFieldName: decapitalize(e.name),
          fields: fieldsEntityAcl
            // not only persistent fields but also not derived relations
            .filter(f => persistentFields(f) || (filterRels(f) && !f.derived))
            .map(f => ({
              name: f.name,
              type: mapToTSTypes(f.type),
            })),
          unique: {
            find: [
              ...fieldsEntityAcl
                .filter(identityFields)
                .filter(oneUniqueInIndex(e))
                .filter(canUpdateBy)
                .map(f => ({
                  name: f.name,
                  type: mapToGQLTypes(f.type),
                  cName: capitalize(f.name),
                })),
            ],
            complex: complexUnique,
          },
        };
      }),

    complexUnique,
    relations,
    persistent: relations.filter(f => f.persistent),
    fields: [...ids, ...fieldsAcl.filter(f => mutableFields(f))].map(f => ({
      name: f.name,
    })),
    args: {
      create: {
        args: [
          ...[
            ...ids,
            ...fieldsAcl.filter(f =>
              /*singleStoredRelations(f) ||*/ mutableFields(f),
            ),
          ].map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
          })),
        ],
        find: fieldsAcl
          .filter(f => /*singleStoredRelations(f) ||*/ mutableFields(f))
          .map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
          })),
      },
      update: {
        args: [
          ...[
            ...ids,
            ...fieldsAcl.filter(f =>
              /*singleStoredRelations(f) ||*/ mutableFields(f),
            ),
          ].map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
          })),
        ],
        find: [
          ...fieldsAcl
            .filter(identityFields)
            .filter(oneUniqueInIndex(entity))
            .map(f => ({
              name: f.name,
              type: mapToTSTypes(f.type),
              cName: capitalize(f.name),
            })),
        ],
        payload: fieldsAcl
          .filter(f => /*singleStoredRelations(f) ||*/ mutableFields(f))
          .map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
          })),
      },
      remove: {
        args: [
          ...[
            ...ids,
            ...fieldsAcl
              .filter(identityFields)
              .filter(oneUniqueInIndex(entity)),
          ].map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
          })),
        ],
        find: [
          ...fieldsAcl
            .filter(identityFields)
            .filter(oneUniqueInIndex(entity))
            .map(f => ({
              name: f.name,
              type: mapToTSTypes(f.type),
              gqlType: mapToGQLTypes(f.type),
              cName: capitalize(f.name),
            })),
        ],
      },
    },
  };
}
