import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import * as inflect from 'inflected';

import { Factory } from 'fte.js';
import { capitalize, decapitalize } from '../../utils';

export const template = 'entity/query/resolver.ts.njs';

export function generate(
  te: Factory,
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter: string,
) {
  return te.run(
    mapper(entity, pack, role, aclAllow, typeMapper, adapter),
    template,
  );
}

export interface MapperOutput {
  name: string;
  singular: string;
  plural: string;
  unique: {
    args: { name: string; type: string }[];
    find: { name: string; type: string; cName: string }[];
    complex: {
      name: string;
      fields: {
        name: string;
        uName: string;
        type: string;
        gqlType?: string;
      }[];
    }[];
  };
  adapter: string;
  idMap: string[];
  relations: {
    derived: boolean;
    field: string;
    refFieldName: string;
    name: string;
    verb: string;
    ref: {
      backField: string;
      usingField: string;
      field: string;
      type: string;
      cField: string;
      entity: string;
      fields: string[];
      using: {
        backField: string;
        entity: string;
        field: string;
      };
    };
  }[];
}

import {
  getFieldsForAcl,
  indexedFields,
  identityFields,
  complexUniqueIndex,
  oneUniqueInIndex,
  relationFieldsExistsIn,
  getRelationNames,
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
  adapter: string,
): MapperOutput {
  let fieldsAcl = getFieldsForAcl(role, pack)(aclAllow, entity);
  let ids = getFields(entity).filter(idField);
  const mapToTSTypes = typeMapper.typescript;
  const mapToGQLTypes = typeMapper.graphql;
  const relations = fieldsAcl.filter(relationFieldsExistsIn(pack)).map(f => {
    let verb = f.relation.verb;
    let ref = {
      usingField: '',
      backField: f.relation.ref.backField,
      entity: f.relation.ref.entity,
      field: f.relation.ref.field,
      type: pack.get(f.relation.ref.entity).fields.get(f.relation.ref.field)
        .type,
      cField: capitalize(f.relation.ref.field),
      fields: [],
      using: {
        backField: '',
        entity: '',
        field: '',
      },
    };
    if (verb === 'BelongsToMany' && (f.relation as BelongsToMany).using) {
      let current = f.relation as BelongsToMany;
      ref.using.entity = current.using.entity;
      ref.using.field = current.using.field;
      ref.backField = current.using.backField;
      //from oda-model/model/belongstomany.ts ensure relation class
      let refe = pack.entities.get(ref.entity);
      let opposite = getRelationNames(refe)
        // по одноименному классу ассоциации
        .filter(
          r =>
            (current.opposite && current.opposite === r) ||
            (refe.fields.get(r).relation instanceof BelongsToMany &&
              (refe.fields.get(r).relation as BelongsToMany).using &&
              (refe.fields.get(r).relation as BelongsToMany).using.entity ===
                (f.relation as BelongsToMany).using.entity),
        )
        .map(r => refe.fields.get(r).relation)
        .filter(
          r => r instanceof BelongsToMany && current !== r,
        )[0] as BelongsToMany;
      /// тут нужно получить поле по которому opposite выставляет свое значение,
      // и значение
      if (opposite) {
        ref.usingField = opposite.using.field;
        ref.backField = opposite.ref.field;
      } else {
        ref.usingField = decapitalize(ref.entity);
      }
      if (f.relation.fields && f.relation.fields.size > 0) {
        f.relation.fields.forEach(field => {
          ref.fields.push(field.name);
        });
      }
    }
    let sameEntity = entity.name === f.relation.ref.entity;
    let refFieldName = `${f.relation.ref.entity}${
      sameEntity ? capitalize(f.name) : ''
    }`;
    return {
      derived: f.derived,
      field: f.name,
      name: capitalize(f.name),
      refFieldName: decapitalize(refFieldName),
      verb,
      ref,
    };
  });

  return {
    name: entity.name,
    singular: inflect.camelize(entity.name, false),
    plural: inflect.camelize(entity.plural, false),
    unique: {
      args: [
        ...ids,
        ...fieldsAcl.filter(identityFields).filter(oneUniqueInIndex(entity)),
      ].map(f => ({
        name: f.name,
        type: mapToTSTypes(f.type),
      })),
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
      complex: complexUniqueIndex(entity).map(i => {
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
      }),
    },
    relations,
    adapter,
    idMap: relations
      .filter(f => f.ref.type === 'ID' && f.verb === 'BelongsTo')
      .map(f => f.field),
  };
}
