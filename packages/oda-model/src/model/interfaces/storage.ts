import { FieldArgs, FieldType, OperationKind } from './types';
import { IEntityRef, IField, IRelation, IOperation, IEnumItem } from './model';
import { RelationBaseInput } from './input';
import { RelationMeta, BaseMeta } from './metadata';

export interface MetadataStorage<T extends BaseMeta> {
  metadata: T;
}

export interface ModelBaseStorage {
  name: string;
  title: string;
  description: string;
}

export interface FieldStorage extends FieldBaseStorage {
  list: boolean;
  map: boolean;
  arguments: Map<string, FieldArgs>;
}

export interface RelationFieldStorage<
  T extends RelationMeta,
  I extends RelationBaseInput<T>
> extends FieldStorage {
  idKey: IEntityRef;
  relation: IRelation<T, I>;
}

export interface RelationBaseStorage {
  name: string;
  entity: string;
  field: string;
  fields: Map<string, IField>;
  opposite?: string;
}

export interface BelongsToStorage extends RelationBaseStorage {
  belongsTo: IEntityRef;
}

export interface BelongsToManyStorage extends RelationBaseStorage {
  belongsToMany: IEntityRef;
  using: IEntityRef;
}

export interface MixinStorage extends EntityBaseStorage {}

export interface EntityBaseStorage extends ModelBaseStorage {
  fields: Map<string, IField>;
  operations: Map<string, IOperation>;
  relations: Set<string>;
  identity: Set<string>;
  required: Set<string>;
  indexed: Set<string>;
}

export interface EntityStorage extends EntityBaseStorage {
  implements: Set<string>;
  embedded: boolean | Set<string>;
  abstract: boolean;
}

export interface FieldBaseStorage extends ModelBaseStorage {
  args?: Map<string, FieldArgs>;
  inheritedFrom?: string;
  type: FieldType;
  entity: string;
}

export interface HasManyStorage extends RelationBaseStorage {
  hasMany: IEntityRef;
}

export interface HasOneStorage extends RelationBaseStorage {
  hasOne: IEntityRef;
}

export interface ScalarStorage extends ModelBaseStorage {}

export interface UnionStorage extends ModelBaseStorage {
  items: Set<string>;
}

export interface EnumStorage extends ModelBaseStorage {
  items: Map<string, IEnumItem>;
}

export interface EnumItemStorage extends ModelBaseStorage {
  value: string;
}

export interface OperationStorage extends FieldBaseStorage {
  actionType: OperationKind;
}

export interface DirectiveStorage extends ModelBaseStorage {
  args?: Map<string, FieldArgs>;
  on?: string[];
}

export interface MutationStorage extends ModelBaseStorage {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}

export interface QueryStorage extends ModelBaseStorage {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}
