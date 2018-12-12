//common queries that is used in code generation
import {
  IEntity,
  IField,
  IPackage,
  IModel,
  IMutation,
  IQuery,
  FieldType,
  IMixin,
  IRelation,
  RelationField,
} from 'oda-model';

let memoizeCache: any = {};

export const resetCache = () => {
  memoizeCache = {};
};

export const getPackages = (model: IModel) =>
  Array.from(model.packages.values());

export const getRealEntities = (pack: IPackage) =>
  Array.from(pack.entities.values()).filter(f => !f.abstract);

export const getUIEntities = (pack: IPackage) =>
  Array.from(pack.entities.values());

export const getScalars = (pack: IPackage) => Array.from(pack.scalars.values());

export const getDirvectives = (pack: IPackage) =>
  Array.from(pack.directives.values());

export const getEnums = (pack: IPackage) => Array.from(pack.enums.values());
export const getUnions = (pack: IPackage) => Array.from(pack.unions.values());

export const getMixins = (pack: IPackage) => [
  ...Array.from(pack.mixins.values()),
  ...(Array.from(pack.entities.values()).filter(e => e.abstract) as IMixin[]),
];

export const fields = (f: IField): boolean => !(f as RelationField).relation;

export const relations = (f: IField): boolean =>
  !!(f as RelationField).relation;

export const getMutations = (pack: IPackage): IMutation[] =>
  Array.from(pack.mutations.values());

export const getQueries = (pack: IPackage): IQuery[] =>
  Array.from(pack.queries.values());

const falseFilter = () => false;

export const canUpdateBy = (f: IField): boolean => {
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

export const oneUniqueInIndex = (entity: IEntity) => {
  let indexList = entity.metadata.persistence.indexes;
  if (indexList !== null && typeof indexList === 'object') {
    return (f: IField) => {
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

export const oneFieldIndex = (entity: IEntity) => {
  let indexList = entity.getMetadata('persistence.indexes');
  if (indexList !== null && typeof indexList === 'object') {
    return (f: IField) => {
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

export const complexUniqueIndex = (entity: IEntity) => {
  let indexList = entity.getMetadata('persistence.indexes');
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

export const complexUniqueFields = (entity: IEntity) =>
  complexUniqueIndex(entity).reduce((result, cur) => {
    result.push(...Object.keys(cur.fields));
    return result;
  }, []);

export const _getFieldNames = (entity: IEntity) =>
  Array.from(entity.fields.values()).map((f: { name: string }) => f.name);

export const getFieldNames = (entity: IEntity) => {
  if (!memoizeCache.hasOwnProperty('getFieldNames')) {
    memoizeCache.getFieldNames = {};
  }
  const cache = memoizeCache.getFieldNames;
  if (!cache.hasOwnProperty(entity.name)) {
    cache[entity.name] = _getFieldNames(entity);
  }
  return cache[entity.name];
};

export const getOrderBy = (role: string) => (allow, entity: IEntity) =>
  searchParamsForAcl(allow, role, entity).filter(f => {
    const field = entity.fields.get(f);
    return field.persistent && !field.relation;
  });

export const searchParamsForAcl = (allow, role: string, entity: IEntity) =>
  getFieldNames(entity)
    // .filter(i => i !== 'id')
    .filter(i =>
      allow(role, entity.fields.get(i).getMetadata('acl.read', role)),
    );

export const _filterForAcl = (role: string, pack: IPackage) => {
  const existingRel = relationFieldsExistsIn(pack);
  return (allow, entity: IEntity) => {
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

export const filterForAcl = (role: string, pack: IPackage) => {
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

export const getRelationNames = (entity: IEntity) =>
  Array.from(entity.relations);

export const derivedFields = (f: IField): boolean => fields(f) && f.derived;

export const derivedFieldsAndRelations = (f: IField): boolean => f.derived;

export const _getFields = (entity: IEntity): IField[] =>
  Array.from(entity.fields.values());

export const getFields = (entity: IEntity): IField[] => {
  if (!memoizeCache.hasOwnProperty('getFields')) {
    memoizeCache.getFields = {};
  }
  const cache = memoizeCache.getFields;
  if (!cache.hasOwnProperty(entity.name)) {
    cache[entity.name] = _getFields(entity);
  }
  return cache[entity.name];
};

export const idField = (f: IField): boolean =>
  fields(f) && (f.name === 'id' || f.name === '_id');

export const _getFieldsForAcl = (role: string, pack: IPackage) => {
  const existingRel = relationFieldsExistsIn(pack);
  return (allow, entity: IEntity): IField[] =>
    getFields(entity)
      .filter(f => !relations(f) || existingRel(f))
      .filter(f => allow(role, f.getMetadata('acl.read', role)));
};

export const getFieldsForAcl = function(role: string, pack: IPackage) {
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

export const relationFieldsExistsIn = (pack: IPackage) => (
  f: IField,
): boolean => relations(f) && pack.entities.has(f.relation.ref.entity);

export const persistentFields = (f: IField): boolean =>
  fields(f) && f.persistent;

export const indexedFields = (f: IField): boolean =>
  fields(f) && f.indexed && !idField(f);

export const indexedRelations = (f: IField): boolean =>
  relations(f) && f.indexed && !idField(f);

export const identityFields = (f: IField): boolean =>
  fields(f) && f.identity && !idField(f);

export const mutableFields = (f: IField): boolean =>
  fields(f) && !idField(f) && f.persistent;

export const nonIdFields = (f: IField): boolean =>
  fields(f) && !idField(f) && f.persistent;

export const getUniqueFieldNames = (entity: IEntity) => [
  'id',
  ...getFields(entity)
    .filter(oneUniqueInIndex(entity))
    .filter(identityFields)
    .map(f => f.name),
];

export const indexes = (e: IEntity) => {
  let result = [];
  let _indexes = e.getMetadata('persistence.indexes', {});
  let keys = Object.keys(_indexes);
  for (let i = 0, len = keys.length; i < len; i++) {
    result.push(_indexes[keys[i]]);
  }
  return result;
};

export const singleStoredRelationsExistingIn = (pack: IPackage) => (
  f: IField,
): boolean =>
  relationFieldsExistsIn(pack)(f) &&
  f.relation.single &&
  f.relation.stored &&
  f.persistent;

export const storedRelationsExistingIn = (pack: IPackage) => (
  f: IField,
): boolean =>
  relationFieldsExistsIn(pack)(f) && f.relation.stored && f.persistent;

// get persistent fields with relations of entity in package
export const persistentRelations = (pack: IPackage) => f =>
  relationFieldsExistsIn(pack)(f) && f.persistent;

export const memoizeEntityMapper = (name, mapper) => (
  entity: IEntity,
  pack: IPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  defaultAdapter?: string,
) => {
  let adapter = entity.getMetadata(
    'persistence.adapter',
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
