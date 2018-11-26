import { MetaModelType, RelationType, FieldType, FieldArgs } from './types';
import { IValidate } from './validation';
import { RelationBaseStorage } from './storage';
import { RelationBaseInput } from './input';
import {
  BaseMeta,
  ModelMeta,
  ScalarMeta,
  MutationMeta,
  QueryMeta,
  DirectiveMeta,
  UnionMeta,
  EnumMeta,
  PackageMeta,
  EntityMeta,
  FieldBaseMeta,
  FieldMeta,
  OperationMeta,
  RelationMeta,
  BelongsToManyMeta,
  BelongsToMeta,
  HasOneMeta,
  HasManyMeta,
} from './metadata';

export interface IMeta<T extends BaseMeta> {
  metadata: T;
}
export interface IModelType<T extends ModelMeta> extends IMeta<T>, IValidate {
  modelType: MetaModelType;
}

export interface IModel extends IModelType<ModelMeta> {
  name: string;
  packages: Map<string, IPackage>;
}

export interface IPackage extends IModelType<PackageMeta> {
  abstract: boolean;
  name: string;
  metaModel: IModel;
  entities: Map<string, IEntity>;
  scalars: Map<string, IScalar>;
  mixins: Map<string, IMixin>;
  enums: Map<string, IEnum>;
  unions: Map<string, IUnion>;
  // ?? нужно или нет, надо подумать
  mutations: Map<string, IMutation>;
  queries: Map<string, IQuery>;
  directives: Map<string, IDirective>;
}

export interface IModelBase<T extends ModelMeta> extends IMeta<T> {
  name: string;
  title?: string;
  description?: string;
}

export interface IScalar extends IModelBase<ScalarMeta> {}

export interface IMutation extends IModelBase<MutationMeta> {
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface IQuery extends IModelBase<QueryMeta> {
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface IDirective extends IModelBase<DirectiveMeta> {
  args: FieldArgs[];
  on: string[];
}

export interface IUnion extends IModelBase<UnionMeta> {
  items: string[];
}

export interface IEnum extends IModelBase<EnumMeta> {
  items: IEnumItemsInput[];
}

export interface IEnumItemsInput {
  value: string;
}

export interface IEntityBase extends IModelType<EntityMeta> {
  name: string;
  plural: string;
  titlePlural: string;
  fields: Map<string, IField>;
}

export interface IMixin extends IEntityBase {}

export interface IEntity extends IEntityBase {
  implements: Set<string>;
  embedded: boolean | string[];
  abstract: boolean;
}

export interface IFieldBase<T extends FieldBaseMeta> extends IModelType<T> {
  args: FieldArgs[];
  name: string;
  type: FieldType;
  inheritedFrom: string;
}

export interface IField extends IFieldBase<FieldMeta> {
  indexed: boolean | string | string[];
  identity: boolean | string | string[];
}

export interface IRelationField<T extends RelationMeta> extends IField {
  relation: IRelation<T>;
}

export interface IOperation extends IFieldBase<OperationMeta> {
  actionType: string;
}

export interface IRelation<T extends RelationMeta> extends IModelType<T> {
  verb: RelationType;
  using?: IEntityRef;
  ref: IEntityRef;
  fields: Map<string, IField>;
  opposite?: string;
  toObject(): RelationBaseStorage;
  updateWith(obj: RelationBaseInput): void;
}

export interface IBelongsToManyRelation extends IRelation<BelongsToManyMeta> {
  belongsToMany: IEntityRef;
}

export interface IBelongsToRelation extends IRelation<BelongsToMeta> {
  belongsTo: IEntityRef;
}

export interface IHasOneRelation extends IRelation<HasOneMeta> {
  hasOne: IEntityRef;
}

export interface IHasManyRelation extends IRelation<HasManyMeta> {
  hasMany: IEntityRef;
}

export interface IEntityRef {
  backField: string;
  entity: string;
  field: string;
}

export type ModelItem =
  | IModel
  | IPackage
  | IEntity
  | IField
  | IRelation<RelationMeta>;

export type Relation =
  | IHasManyRelation
  | IHasOneRelation
  | IBelongsToRelation
  | IBelongsToRelation;

export function isModel(item: ModelItem): item is IModel {
  return item.modelType === 'model';
}

export function isPackage(item: ModelItem): item is IPackage {
  return item.modelType === 'package';
}

export function isEntity(item: ModelItem): item is IEntity {
  return item.modelType === 'entity';
}

export function isField(item: ModelItem): item is IField {
  return item.modelType === 'field';
}

export function isRelation<T extends RelationMeta>(
  item: ModelItem,
): item is IRelation<T> {
  return (
    item.modelType === 'BelongsTo' ||
    item.modelType === 'BelongsToMany' ||
    item.modelType === 'HasOne' ||
    item.modelType === 'HasMany'
  );
}

export function IsBelongsTo(item: Relation): item is IBelongsToRelation {
  return isRelation(item) && item.modelType === 'BelongsTo';
}

export function IsBelongsToMany(item: Relation): item is IBelongsToRelation {
  return isRelation(item) && item.modelType === 'BelongsToMany';
}

export function IsHasOne(item: Relation): item is IBelongsToRelation {
  return isRelation(item) && item.modelType === 'HasOne';
}

export function IsHasMany(item: Relation): item is IBelongsToRelation {
  return isRelation(item) && item.modelType === 'HasMany';
}
