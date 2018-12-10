import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { capitalize, decapitalize } from '../../../utils';
import { Factory } from 'fte.js';
import { get } from 'lodash';

export const template = {
  mongoose: 'entity/data/mongoose/connector.ts.njs',
  sequelize: 'entity/data/sequelize/connector.ts.njs',
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
  description: string;
  unique: string[];
  complexUniqueIndex: any[] /* {
    fields: {
      [key: string]: number,
    };
    options: {
      sparse?: boolean,
      unique: boolean,
    };
  };*/;
  loaders: any[];
  fields: string[];
  embedded: string[];
  filterAndSort: { type: string; name: string; gqlType: string }[];
  search: {
    type: string;
    name: string;
    gqlType: string;
    rel: boolean;
    _name?: string;
  }[];
  updatableRels: string[];
  ownerFieldName: string;
  cOwnerFieldName: string;
  args: {
    create: { name: string; type: string }[];
    update: {
      find: { name: string; type: string; cName: string }[];
      payload: { name: string; type: string }[];
    };
    remove: { name: string; type: string; cName: string }[];
    getOne: { name: string; type: string; cName: string }[];
  };
  relations: {
    field: string;
    relationName: string;
    verb: string;
    addArgs: { name: string; type: string }[];
    removeArgs: { name: string; type: string }[];
    ref: {
      backField: string;
      usingField: string;
      field: string;
      entity: string;
      fields: string[];
      using: {
        backField: string;
        entity: string;
        field: string;
      };
    };
    single: boolean;
    embedded?: boolean | string;
  }[];
}

import {
  getUniqueFieldNames,
  getFields,
  indexedFields,
  persistentFields,
  singleStoredRelationsExistingIn,
  mutableFields,
  identityFields,
  persistentRelations,
  oneUniqueInIndex,
  getRelationNames,
  complexUniqueIndex,
  idField,
  memoizeEntityMapper,
} from '../../../queries';

export const mapper = memoizeEntityMapper('data.adapter.connector', _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter?: string,
): MapperOutput {
  const mapToTSTypes = typeMapper.typescript;
  const mapToGQLTypes = typeMapper.graphql;
  const singleStoredRelations = singleStoredRelationsExistingIn(pack);
  const persistentRelation = persistentRelations(pack);
  let aclRead = get(entity.metadata, 'acl.read');
  let singleUnique = oneUniqueInIndex(entity);

  let ids = getFields(entity).filter(idField);
  let embedded = getFields(entity).filter(
    f => f.relation && f.relation.embedded,
  );
  return {
    name: entity.name,
    unique: getUniqueFieldNames(entity),
    complexUniqueIndex: complexUniqueIndex(entity).map(i => {
      let fields = Object.keys(i.fields)
        .map(fn => entity.fields.get(fn))
        .map(f => ({
          name: f.name,
          uName: capitalize(f.name),
          type: mapToTSTypes(f.type),
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
        fields,
      };
    }),
    loaders: getUniqueFieldNames(entity).map(i => ({
      loader: capitalize(i),
      field: i,
    })),
    fields: getFields(entity)
      .filter(persistentFields)
      .map(f => f.name),
    filterAndSort: getFields(entity)
      .filter(f => persistentFields(f) && indexedFields(f))
      .map(f => ({
        name: f.name,
        type: mapToTSTypes(f.type),
        gqlType: mapToGQLTypes(f.type),
      })),
    search: [
      ...ids,
      ...getFields(entity).filter(
        f => indexedFields(f) || singleStoredRelations(f),
      ),
    ].map(f => ({
      name: f.name,
      type: mapToTSTypes(f.type),
      gqlType: mapToGQLTypes(f.type),
      rel: !!f.relation,
      _name: f['_name'] || f.name,
    })),
    ownerFieldName: decapitalize(entity.name),
    cOwnerFieldName: capitalize(entity.name),
    description: entity.description,
    updatableRels: getFields(entity)
      .filter(f => singleStoredRelations(f))
      .map(f => f.name),
    args: {
      create: [
        ...[
          ...ids,
          ...getFields(entity).filter(
            f =>
              singleStoredRelations(f) ||
              mutableFields(f) ||
              (f.relation && f.relation.embedded),
          ),
        ].map(f => ({
          name: f.name,
          type: mapToTSTypes(f.type),
        })),
      ],
      update: {
        find: [
          ...[
            ...ids,
            ...getFields(entity)
              .filter(identityFields)
              .filter(singleUnique),
          ].map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
            cName: capitalize(f.name),
          })),
        ],
        payload: getFields(entity)
          .filter(f => singleStoredRelations(f) || mutableFields(f))
          .map(f => ({
            name: f.name,
            type: mapToTSTypes(f.type),
          })),
      },
      remove: [
        ...ids,
        ...getFields(entity)
          .filter(identityFields)
          .filter(singleUnique),
      ].map(f => ({
        name: f.name,
        type: mapToTSTypes(f.type),
        cName: capitalize(f.name),
      })),
      getOne: [...ids, ...getFields(entity).filter(identityFields)].map(f => ({
        name: f.name,
        type: mapToTSTypes(f.type),
        cName: capitalize(f.name),
      })),
    },
    embedded: Object.keys(
      embedded
        .map(f => f.relation.ref.entity)
        .reduce((res, i) => {
          res[i] = 1;
          return res;
        }, {}),
    ),
    relations: getFields(entity)
      .filter(persistentRelation)
      .map(f => {
        let verb = f.relation.verb;
        let ref = {
          usingField: '',
          backField: f.relation.ref.backField,
          entity: f.relation.ref.entity,
          field: f.relation.ref.field,
          fields: [],
          using: {
            backField: '',
            entity: '',
            field: '',
          },
        };
        let sameEntity = entity.name === f.relation.ref.entity;
        let refFieldName = `${f.relation.ref.entity}${
          sameEntity ? capitalize(f.name) : ''
        }`;
        let refe = pack.entities.get(ref.entity);

        let addArgs = [
          {
            name: decapitalize(entity.name),
            type: mapToTSTypes(ids[0].type),
          },
          {
            name: decapitalize(refFieldName),
            type: f.relation.embedded
              ? `Partial${f.relation.ref.entity}`
              : mapToTSTypes(refe.fields.get(ref.field).type),
          },
        ];
        let removeArgs = f.relation.embedded ? [addArgs[0]] : [...addArgs];

        if (verb === 'BelongsToMany' && (f.relation as BelongsToMany).using) {
          let current = f.relation as BelongsToMany;
          ref.using.entity = current.using.entity;
          ref.using.field = current.using.field;
          ref.backField = current.using.backField;
          //from oda-model/model/belongstomany.ts ensure relation class
          // let refe = pack.entities.get(ref.entity);
          let opposite = getRelationNames(refe)
            // по одноименному классу ассоциации
            .filter(
              r =>
                (current.opposite && current.opposite === r) ||
                (refe.fields.get(r).relation instanceof BelongsToMany &&
                  (refe.fields.get(r).relation as BelongsToMany).using &&
                  (refe.fields.get(r).relation as BelongsToMany).using
                    .entity === (f.relation as BelongsToMany).using.entity),
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
              addArgs.push({
                name: field.name,
                type: mapToTSTypes(field.type),
              });
            });
          }
        }
        return {
          field: f.name,
          relationName: capitalize(f.relation.fullName),
          shortName: capitalize(f.relation.shortName),
          refFieldName: decapitalize(refFieldName),
          verb,
          addArgs,
          removeArgs,
          ref,
          single: f.relation.single,
          embedded: f.relation.embedded ? f.relation.ref.entity : false,
        };
      }),
  };
}
