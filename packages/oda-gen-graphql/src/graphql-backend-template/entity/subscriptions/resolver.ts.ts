import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { capitalize, decapitalize, printRequired } from '../../utils';
import { Factory } from 'fte.js';

export const template = 'entity/subscriptions/resolver.ts.njs';

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
  unionCheck: string[];
  connections: {
    refFieldName: string;
    name: string;
    fields: {
      name: string;
      type: string;
    }[];
  }[];
  relations: any;
}

// для каждой операции свои параметры с типами должны быть.
// специальный маппер типов для ts где ID === string

import {
  getFieldsForAcl,
  mutableFields,
  persistentRelations,
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
): MapperOutput {
  let fieldsAcl = getFieldsForAcl(role, pack)(aclAllow, entity);
  let ids = getFields(entity).filter(idField);
  const mapToGQLTypes = typeMapper.graphql;

  return {
    name: entity.name,
    ownerFieldName: decapitalize(entity.name),
    unionCheck: [
      ...ids.map(f => ({
        name: f.name,
        type: 'ID',
        required: false,
      })),
      ...fieldsAcl.filter(mutableFields),
    ].map(f => f.name),
    connections: fieldsAcl.filter(persistentRelations(pack)).map(f => {
      let relFields = [];
      if (f.relation.fields && f.relation.fields.size > 0) {
        f.relation.fields.forEach(field => {
          relFields.push({
            name: field.name,
            type: `${mapToGQLTypes(field.type)}${printRequired(field)}`,
          });
        });
      }
      let sameEntity = entity.name === f.relation.ref.entity;
      let refFieldName = `${f.relation.ref.entity}${
        sameEntity ? capitalize(f.name) : ''
      }`;
      return {
        refFieldName: decapitalize(refFieldName),
        name: f.relation.fullName,
        fields: relFields,
        single: f.relation.single,
      };
    }),
    relations: fieldsAcl.filter(relationFieldsExistsIn(pack)).map(f => {
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
    }),
  };
}
