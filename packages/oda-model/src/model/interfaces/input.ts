import { FieldArgs, FieldType, AsHash, OperationKind } from './types';
import {
  BaseMeta,
  ScalarMeta,
  EntityBaseMeta,
  EntityMeta,
  MixinMeta,
  QueryMeta,
  MutationMeta,
  FieldBaseMeta,
  FieldMeta,
  UnionMeta,
  DirectiveMeta,
  EnumMeta,
  EnumItemMeta,
  OperationMeta,
  ModelMeta,
  PackageMeta,
  RelationMeta,
  BelongsToMeta,
  BelongsToManyMeta,
  HasManyMeta,
  HasOneMeta,
} from './metadata';

export interface MetadataInput<T extends BaseMeta> {
  metadata: T;
}

export interface ModelBaseInput<T extends BaseMeta> extends MetadataInput<T> {
  name: string;
  title?: string;
  description?: string;
}

export interface ScalarInput extends ModelBaseInput<ScalarMeta> {}

export interface FieldBaseInput<T extends FieldBaseMeta>
  extends ModelBaseInput<T> {
  args?: AsHash<FieldArgs>;
  inheritedFrom?: string;
  type?: FieldType;
  derived?: boolean;
  persistent?: boolean;
  entity?: string;
  defaultValue?: string;
}

export interface FieldInput extends FieldBaseInput<FieldMeta> {
  list?: boolean;
  map?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
  required?: boolean;
  arguments?: AsHash<FieldArgs>;
  relation?: (
    | { hasMany: string }
    | { hasOne: string }
    | { belongsTo: string }
    | { belongsToMany: string; using: string }) & {
    entity: string;
    field: string;
  };
}

export interface EntityBaseInput<T extends EntityBaseMeta>
  extends ModelBaseInput<T> {
  plural?: string;
  titlePlural?: string;
  fields?: AsHash<FieldInput>;
  operations?: AsHash<OperationInput>;
}

export interface EntityInput extends EntityBaseInput<EntityMeta> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface MixinInput extends EntityBaseInput<MixinMeta> {}

export interface ModelPackageInput extends ModelBaseInput<PackageMeta> {
  name: string;
  title?: string;
  description?: string;
  abstract?: boolean;
  entities: string[];
  mutations: any[];
  queries: any[];
  directives: any[];
  scalars: any[];
  enums: any[];
  mixins: any[];
  unions: any[];
}

export interface MetaModelInput extends ModelBaseInput<ModelMeta> {
  entities: EntityInput[];
  packages: ModelPackageInput[];
  mutations?: MutationInput[];
  queries?: QueryInput[];
  scalars: ScalarInput[];
  directives: DirectiveInput[];
  enums?: EnumInput[];
  unions?: UnionInput[];
  mixins?: MixinInput[];
  name: string;
  title?: string;
  description?: string;
}

export interface RelationBaseInput<T extends RelationMeta>
  extends MetadataInput<T> {
  entity: string;
  field: string;
  name?: string;
  embedded?: boolean;
  fields?: AsHash<FieldArgs>;
  opposite?: string;
}

export interface BelongsToInput extends RelationBaseInput<BelongsToMeta> {
  belongsTo: string;
}

export interface BelongsToManyInput
  extends RelationBaseInput<BelongsToManyMeta> {
  belongsToMany: string;
  using: string;
}

export interface HasManyInput extends RelationBaseInput<HasManyMeta> {
  hasMany: string;
}

export interface HasOneInput extends RelationBaseInput<HasOneMeta> {
  hasOne: string;
}

export interface MutationInput extends ModelBaseInput<MutationMeta> {
  args: AsHash<FieldArgs>;
  payload: AsHash<FieldArgs>;
}

export interface QueryInput extends ModelBaseInput<QueryMeta> {
  args: AsHash<FieldArgs>;
  payload: AsHash<FieldArgs>;
}

export interface UnionInput extends ModelBaseInput<UnionMeta> {
  items: string[];
}

export interface DirectiveInput extends ModelBaseInput<DirectiveMeta> {
  args?: AsHash<FieldArgs>;
  on?: string[];
}

export interface EnumItemInput extends ModelBaseInput<EnumItemMeta> {
  value?: string;
}

export interface EnumInput extends ModelBaseInput<EnumMeta> {
  items: (EnumItemInput | string)[];
}

export interface OperationInput extends FieldBaseInput<OperationMeta> {
  actionType: OperationKind;
}

export interface IModelHook {
  name: string;
  entities?: AsHash<EntityInput>;
  mutations?: AsHash<MutationInput>;
  queries?: AsHash<QueryInput>;
}

export interface EntityReferenceInput {
  backField: string;
  field: string;
  entity: string;
}
