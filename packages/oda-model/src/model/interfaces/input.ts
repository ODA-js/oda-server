import { FieldArgs, FieldType, AsHash } from './types';
import { BaseMeta, ModelMeta, ScalarMeta, EntityBaseMeta, EntityMeta, MixinMeta, QueryMeta, MutationMeta, FieldBaseMeta } from './metadata';

export interface MetadataInput<T extends BaseMeta> {
  metadata: T;
}

export interface ModelBaseInput<T> extends MetadataInput<T extends ModelMeta> {
  name: string;
  title?: string;
  description?: string;
}

export interface ScalarInput extends ModelBaseInput<ScalarMeta> {}

export interface FieldInput extends FieldBaseInput {
  list?: boolean;
  map?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
  required?: boolean;
  arguments?: [FieldArgs];
  relation?: (
    | { hasMany: string }
    | { hasOne: string }
    | { belongsTo: string }
    | { belongsToMany: string; using: string }) & {
    entity: string;
    field: string;
  };
}

export interface EntityBaseInput<T extends EntityBaseMeta> extends ModelBaseInput<T> {
  plural?: string;
  titlePlural?: string;
  fields?: AsHash<FieldInput>;
  operations?: AsHash<OperationInput>;
}

export interface BelongsToInput extends RelationBaseInput {
  belongsTo: string;
}

export interface BelongsToManyInput extends RelationBaseInput {
  belongsToMany: string;
  using: string;
}

export interface EntityInput extends EntityBaseInput<EntityMeta> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface MixinInput extends EntityBaseInput<MixinMeta> {}

export interface ModelPackageInput {
  name: string;
  title?: string;
  description?: string;
  entities: string[];
  mutations: any[];
  queries: any[];
  directives: any[];
  scalars: any[];
  enums: any[];
  unions: any[];
  mixins: any[];
}

export interface MetaModelInput {
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

export interface RelationBaseInput {
  /**
   * нужно в случае когда мы будем показывать атрибут связи, и ассоциацию отдельно???
   * больше не зачем
   */
  metadata?: { [key: string]: any };
  embedded?: boolean;
  name?: string;
  entity: string;
  field: string;
  fields?: AsHash<FieldInput>;
  opposite?: string;
}

export interface MutationInput extends ModelBaseInput<MutationMeta> {
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface QueryInput extends ModelBaseInput<QueryMeta> {
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface FieldBaseInput<T extends FieldBaseMeta> extends ModelBaseInput<T> {
  args?: FieldArgs[];
  inheritedFrom?: string;
  type?: FieldType;
  derived?: boolean;
  persistent?: boolean;
  entity?: string;
  defaultValue?: string;
}

export interface HasManyInput extends RelationBaseInput {
  hasMany: string;
}

export interface HasOneInput extends RelationBaseInput {
  hasOne: string;
}

export interface UnionInput extends ModelBaseInput {
  items: string[];
}

export interface DirectiveInput extends ModelBaseInput {
  args?: FieldArgs[];
  on?: string[];
}

export interface EnumItemInput extends ModelBaseInput {
  value?: string;
}

export interface EnumInput extends ModelBaseInput {
  items: (EnumItemInput | string)[];
}

export interface OperationInput extends FieldBaseInput {
  actionType: string;
}

export interface ModelPackageInput extends ModelBaseInput {
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
