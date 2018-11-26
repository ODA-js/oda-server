import { FieldArgs, FieldType } from './types';
import { IEntityRef, IField, IRelation, IOperation } from './model';
import { EnumItemInput } from './input';
import { RelationMeta } from './metadata';

export interface FieldStorage extends FieldBaseStorage {
  list: boolean;
  map: boolean;
  arguments: [FieldArgs];
}

export interface RealtionFieldStorage<T extends RelationMeta>
  extends FieldStorage {
  idKey: IEntityRef;
  relation: IRelation<T>;
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
  embedded?: boolean | Set<string>;
  abstract?: boolean;
}

export interface FieldBaseStorage extends ModelBaseStorage {
  args?: FieldArgs[];
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

export interface ModelBaseStorage {
  name: string;
  title: string;
  description: string;
}

export interface ScalarStorage extends ModelBaseStorage {}

export interface UnionStorage extends ModelBaseStorage {
  items: string[];
}

export interface EnumStorage extends ModelBaseStorage {
  items: EnumItemInput[];
}

export interface OperationStorage extends FieldBaseStorage {
  actionType: string;
}

export interface DirectiveStorage extends ModelBaseStorage {
  args?: FieldArgs[];
  on?: string[];
}

export interface MutationStorage extends ModelBaseStorage {
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface QueryStorage extends ModelBaseStorage {
  args: FieldArgs[];
  payload: FieldArgs[];
}
