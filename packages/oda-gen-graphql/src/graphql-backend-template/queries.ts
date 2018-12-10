//common queries that is used in code generation
import {
  Entity,
  Field,
  ModelPackage,
  MetaModel,
  Mutation,
  Query,
  FieldType,
  Mixin,
} from 'oda-model';
import { IMixin } from 'oda-model/dist/model/interfaces';

let memoizeCache: any = {};

export const resetCache = () => {
  memoizeCache = {};
};

export const getPackages = (model: MetaModel) =>
  Array.from(model.packages.values());

export const getRealEntities = (pack: ModelPackage) =>
  Array.from(pack.entities.values()).filter(f => !f.abstract);

export const getUIEntities = (pack: ModelPackage) =>
  Array.from(pack.entities.values());

export const getScalars = (pack: ModelPackage) =>
  Array.from(pack.scalars.values());

export const getDirvectives = (pack: ModelPackage) =>
  Array.from(pack.directives.values());

export const getEnums = (pack: ModelPackage) => Array.from(pack.enums.values());
export const getUnions = (pack: ModelPackage) =>
  Array.from(pack.unions.values());

export const getMixins = (pack: ModelPackage) => [
  ...Array.from(pack.mixins.values()),
  ...(Array.from(pack.entities.values()).filter(e => e.abstract) as IMixin[]),
];

export const fields = (f: Field): boolean => !f.relation;

export const relations = (f: Field): boolean => !!f.relation;

export const getMutations = (pack: ModelPackage): Mutation[] =>
  Array.from(pack.mutations.values());

export const getQueries = (pack: ModelPackage): Query[] =>
  Array.from(pack.queries.values());

const falseFilter = () => false;

export const canUpdateBy = (f: Field): boolean => {
  let result: boolean;
  if (typeof f.type === 'string') {
    const type = f.type.toLocaleLowerCase();
    result = type !== 'fileupload' && type !== 'imageupload';
  } else if (f.type && typeof f.type === 'object') {
    result = f.type.type === 'enum';
  } else {
    result = true;
  }
  return result;
};

export const oneUniqueInIndex = (entity: Entity) => {
  let indexList = entity.getMetadata('storage.indexes');
  if (indexList !== null && typeof indexList === 'object') {
    return (f: Field) => {
      let result = false;
      let iNames = Object.keys(indexList);
      for (let i = 0, len = iNames.length; i < len; i++) {
        let iName = iNames[i];
        if (
          indexList[iName].options.unique &&
          indexList[iName].fields[f.name]
        ) {
          // only one in unique index
          result = Object.keys(indexList[iName].fields).length === 1;
          if (result) {
            break;
          }
        }
      }
      return result;
    };
  } else {
    return falseFilter;
  }
};

export const oneFieldIndex = (entity: Entity) => {
  let indexList = entity.getMetadata('storage.indexes');
  if (indexList !== null && typeof indexList === 'object') {
    return (f: Field) => {
      let result = false;
      let iNames = Object.keys(indexList);
      for (let i = 0, len = iNames.length; i < len; i++) {
        let iName = iNames[i];
        if (indexList[iName].fields[f.name]) {
          // only one in unique index
          result = Object.keys(indexList[iName].fields).length === 1;
          if (result) {
            break;
          }
        }
      }
      return result;
    };
  } else {
    return falseFilter;
  }
};

export const complexUniqueIndex = (entity: Entity) => {
  let indexList = entity.getMetadata('storage.indexes');
  if (indexList) {
    return Object.keys(indexList)
      .filter(
        i =>
          indexList[i].options.unique &&
          Object.keys(indexList[i].fields).length > 1,
      )
      .map(i => {
        return {
          name: i,
          ...indexList[i],
        };
      });
  } else {
    return [];
  }
};

export const complexUniqueFields = (entity: Entity) =>
  complexUniqueIndex(entity).reduce((result, cur) => {
    result.push(...Object.keys(cur.fields));
    return result;
  }, []);

export const _getFieldNames = (entity: Entity) =>
  Array.from(entity.fields.values()).map((f: { name: string }) => f.name);

export const getFieldNames = (entity: Entity) => {
  if (!memoizeCache.hasOwnProperty('getFieldNames')) {
    memoizeCache.getFieldNames = {};
  }
  const cache = memoizeCache.getFieldNames;
  if (!cache.hasOwnProperty(entity.name)) {
    cache[entity.name] = _getFieldNames(entity);
  }
  return cache[entity.name];
};

export const getOrderBy = (role: string) => (allow, entity: Entity) =>
  searchParamsForAcl(allow, role, entity).filter(f => {
    const field = entity.fields.get(f);
    return field.persistent && !field.relation;
  });

export const searchParamsForAcl = (allow, role: string, entity: Entity) =>
  getFieldNames(entity)
    // .filter(i => i !== 'id')
    .filter(i =>
      allow(role, entity.fields.get(i).getMetadata('acl.read', role)),
    );

export const _filterForAcl = (role: string, pack: ModelPackage) => {
  const existingRel = relationFieldsExistsIn(pack);
  return (allow, entity: Entity) => {
    return Object.keys(
      getFieldNames(entity)
        .concat(getRelationNames(entity))
        .reduce((res, cur) => {
          res[cur] = 1;
          return res;
        }, {}),
    ).filter(f => {
      const field = entity.fields.get(f);
      return (
        (!relations(field) || existingRel(field)) &&
        allow(role, field.getMetadata('acl.read', role))
      );
    });
  };
};

export const filterForAcl = (role: string, pack: ModelPackage) => {
  if (!memoizeCache.hasOwnProperty('filterForAcl')) {
    memoizeCache.filterForAcl = {};
  }
  const cv = role + pack.name;
  const cache = memoizeCache.filterForAcl;
  if (!cache.hasOwnProperty(cv)) {
    cache[cv] = _filterForAcl(role, pack);
  }
  return cache[cv];
};

export const getRelationNames = (entity: Entity) =>
  Array.from(entity.relations);

export const derivedFields = (f: Field): boolean => fields(f) && f.derived;

export const derivedFieldsAndRelations = (f: Field): boolean => f.derived;

export const _getFields = (entity: Entity): Field[] =>
  Array.from(entity.fields.values());

export const getFields = (entity: Entity): Field[] => {
  if (!memoizeCache.hasOwnProperty('getFields')) {
    memoizeCache.getFields = {};
  }
  const cache = memoizeCache.getFields;
  if (!cache.hasOwnProperty(entity.name)) {
    cache[entity.name] = _getFields(entity);
  }
  return cache[entity.name];
};

export const idField = (f: Field): boolean =>
  fields(f) && (f.name === 'id' || f.name === '_id');

export const _getFieldsForAcl = (role: string, pack: ModelPackage) => {
  const existingRel = relationFieldsExistsIn(pack);
  return (allow, entity: Entity): Field[] =>
    getFields(entity)
      .filter(f => !relations(f) || existingRel(f))
      .filter(f => allow(role, f.getMetadata('acl.read', role)));
};

export const getFieldsForAcl = function(role: string, pack: ModelPackage) {
  const cv = role + pack.name;
  if (!memoizeCache.hasOwnProperty('getFieldsForAcl')) {
    memoizeCache.getFieldsForAcl = {};
  }
  const cache = memoizeCache.getFieldsForAcl;
  if (!cache.hasOwnProperty(cv)) {
    cache[cv] = _getFieldsForAcl(role, pack);
  }
  return cache[cv];
};

export const relationFieldsExistsIn = (pack: ModelPackage) => (
  f: Field,
): boolean => relations(f) && pack.entities.has(f.relation.ref.entity);

export const persistentFields = (f: Field): boolean =>
  fields(f) && f.persistent;

export const indexedFields = (f: Field): boolean =>
  fields(f) && f.indexed && !idField(f);

export const indexedRelations = (f: Field): boolean =>
  relations(f) && f.indexed && !idField(f);

export const identityFields = (f: Field): boolean =>
  fields(f) && f.identity && !idField(f);

export const mutableFields = (f: Field): boolean =>
  fields(f) && !idField(f) && f.persistent;

export const nonIdFields = (f: Field): boolean =>
  fields(f) && !idField(f) && f.persistent;

export const getUniqueFieldNames = (entity: Entity) => [
  'id',
  ...getFields(entity)
    .filter(oneUniqueInIndex(entity))
    .filter(identityFields)
    .map(f => f.name),
];

export const indexes = (e: Entity) => {
  let result = [];
  let _indexes = e.getMetadata('storage.indexes', {});
  let keys = Object.keys(_indexes);
  for (let i = 0, len = keys.length; i < len; i++) {
    result.push(_indexes[keys[i]]);
  }
  return result;
};

export const singleStoredRelationsExistingIn = (pack: ModelPackage) => (
  f: Field,
): boolean =>
  relationFieldsExistsIn(pack)(f) &&
  f.relation.single &&
  f.relation.stored &&
  f.persistent;

export const storedRelationsExistingIn = (pack: ModelPackage) => (
  f: Field,
): boolean =>
  relationFieldsExistsIn(pack)(f) && f.relation.stored && f.persistent;

// get persistent fields with relations of entity in package
export const persistentRelations = (pack: ModelPackage) => f =>
  relationFieldsExistsIn(pack)(f) && f.persistent;

export const memoizeEntityMapper = (name, mapper) => (
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  defaultAdapter?: string,
) => {
  let adapter = entity.getMetadata(
    'storage.adapter',
    defaultAdapter || 'mongoose',
  );
  if (!memoizeCache.hasOwnProperty(name)) {
    memoizeCache[name] = {};
  }
  const cv =
    (role || 'system') + (pack.name || 'system') + entity.name + adapter;
  const cache = memoizeCache[name];
  if (!cache.hasOwnProperty(cv)) {
    cache[cv] = mapper(entity, pack, role, aclAllow, typeMapper, adapter);
  }
  return cache[cv];
};
