import { ISimpleField } from '../simplefield';
import { IField, isISimpleField } from '../field';
import { IEntity } from '../entity';
import { IndexEntry } from '../entitybase';

/**
 * checks if field is _id or id
 * @param f field
 */
export const idField = (f: ISimpleField) =>
  (f.name === '_id' || f.name === 'id') && f.identity;

export const uniqueField = (f: ISimpleField) => f.identity;

/**
 * checks if field is mutable
 * @param f field
 */
export const mutableFields = (f: ISimpleField): boolean =>
  !idField(f) && f.persistent;

/**
 * check if field is stored
 * @param f field
 */
export const storedRelations = (f: IField): boolean =>
  !isISimpleField(f) && f.persistent;

export const getIndexedFields = (filter: (i: IndexEntry) => boolean) => (
  entity: IEntity,
) => {
  const indexes = entity.metadata.persistence.indexes;
  return (Object.keys(indexes)
    .map(name => {
      const entry = indexes[name];
      const fields = entry.fields;
      return filter(entry)
        ? ([name, Object.keys(fields).map(f => entity.fields.get(f))] as [
            string,
            IField[]
          ])
        : undefined;
    })
    .filter(f => f) as unknown) as [string, IField[]];
};

export const getUniqueIndexedFields = () =>
  getIndexedFields(
    (entry: IndexEntry) => !!(entry.options && entry.options.unique),
  );

export const getGeneralIndexedFields = () =>
  getIndexedFields((entry: IndexEntry) => !!entry);
