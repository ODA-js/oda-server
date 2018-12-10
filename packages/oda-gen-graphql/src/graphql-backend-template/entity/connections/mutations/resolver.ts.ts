import { Entity, ModelPackage, FieldType, BelongsToMany } from 'oda-model';
import { capitalize, decapitalize } from '../../../utils';
import { Factory } from 'fte.js';
import {
  persistentRelations,
  getFieldsForAcl,
  memoizeEntityMapper,
  getFields,
  idField,
} from '../../../queries';

export const template = 'entity/connections/mutations/resolver.ts.njs';

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
  embedded: string[];
  connections: {
    opposite: string;
    relationName: string;
    name: string;
    refEntity: string;
    addArgs: { name: string; type: string }[];
    removeArgs: { name: string; type: string }[];
    ref: {
      fields: string[];
    };
    single: boolean;
    embedded?: boolean | string;
  }[];
}

// для каждой операции свои параметры с типами должны быть.
// специальный маппер типов для ts где ID === string

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  const mapToTSTypes = typeMapper.typescript;
  let ids = getFields(entity).filter(idField);
  let embedded = getFields(entity).filter(
    f => f.relation && f.relation.embedded,
  );
  return {
    name: entity.name,
    ownerFieldName: decapitalize(entity.name),
    embedded: Object.keys(
      embedded
        .map(f => f.relation.ref.entity)
        .reduce((res, i) => {
          res[i] = 1;
          return res;
        }, {}),
    ),
    connections: getFieldsForAcl(role, pack)(aclAllow, entity)
      .filter(persistentRelations(pack))
      .map(f => {
        let verb = f.relation.verb;
        let ref = {
          fields: [],
        };
        let sameEntity = entity.name === f.relation.ref.entity;
        let refFieldName = `${f.relation.ref.entity}${
          sameEntity ? capitalize(f.name) : ''
        }`;
        let refEntity = f.relation.ref.entity;
        let addArgs = [
          {
            name: decapitalize(entity.name),
            type: mapToTSTypes(ids[0].type),
          },
          {
            name: decapitalize(refFieldName),
            type: f.relation.embedded
              ? `Partial${f.relation.ref.entity}`
              : mapToTSTypes(ids[0].type),
          },
        ];
        let removeArgs = f.relation.embedded ? [addArgs[0]] : [...addArgs];

        if (verb === 'BelongsToMany' && (f.relation as BelongsToMany).using) {
          if (f.relation.fields && f.relation.fields.size > 0) {
            f.relation.fields.forEach(field => {
              ref.fields.push(field.name);
              addArgs.push({
                name: field.name,
                type: mapToTSTypes(field.type),
              });
            });
          }
        }
        return {
          opposite: f.relation.opposite,
          refEntity,
          relationName: f.relation.fullName,
          shortName: f.relation.shortName,
          name: f.name,
          refFieldName: decapitalize(refFieldName),
          addArgs,
          removeArgs,
          ref,
          single: f.relation.single,
          embedded: f.relation.embedded ? f.relation.ref.entity : false,
        };
      }),
  };
}
