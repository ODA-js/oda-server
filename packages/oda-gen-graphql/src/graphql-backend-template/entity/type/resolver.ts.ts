import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { capitalize, decapitalize } from '../../utils';
import { Factory } from 'fte.js';
import { memoizeEntityMapper } from '../../queries';

export const template = 'entity/type/resolver.ts.njs';

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
  adapter: string;
  description: string;
  ownerFieldName: string;
  fields: any;
  relations: {
    derived: boolean;
    field: string;
    refFieldName: string;
    name: string;
    verb: string;
    idMap: string[];
    embedded: boolean;
    single: boolean;
    ref: {
      backField: string;
      usingField: string;
      usingIndex: string;
      field: string;
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

// для каждой операции свои параметры с типами должны быть.
// специальный маппер типов для ts где ID === string

import {
  getFieldsForAcl,
  getRelationNames,
  relationFieldsExistsIn,
  derivedFields,
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
  const fieldMap = getFieldsForAcl(role, pack);
  return {
    name: entity.name,
    adapter,
    ownerFieldName: decapitalize(entity.name),
    description: entity.description,
    relations: fieldsAcl.filter(relationFieldsExistsIn(pack)).map(f => {
      let verb = f.relation.verb;

      let ref = {
        usingField: '',
        backField: f.relation.ref.backField,
        entity: f.relation.ref.entity,
        usingIndex: '',
        field: f.relation.ref.field,
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
        ref.usingIndex = capitalize(ref.backField);
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
        embedded: f.relation.embedded,
        single: f.relation.single,
        idMap: fieldMap(aclAllow, pack.entities.get(ref.entity))
          .filter(relationFieldsExistsIn(pack))
          .map(fld => ({
            verb: fld.relation.verb,
            type: pack
              .get(fld.relation.ref.entity)
              .fields.get(fld.relation.ref.field).type,
            field: fld.name,
          }))
          .filter(fld => fld.type === 'ID' && fld.verb === 'BelongsTo')
          .map(fld => fld.field),
      };
    }),
    fields: fieldsAcl
      .filter(derivedFields) // пригодиться для security Проверки по полям
      .map(f => {
        return {
          derived: f.derived,
          field: f.name,
          name: capitalize(f.name),
          // можно добавить аргументы
        };
      }),
  };
}
