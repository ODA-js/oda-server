import {
  MetaModelType,
  RelationType,
  FieldType,
  FieldArgs,
  OperationKind,
  DirectiveLocation,
  ComplexType,
} from './types';
import { IValidate } from './validation';
import {
  MetadataInput,
  EnumItemInput,
  MetaModelInput,
  ModelPackageInput,
  ScalarInput,
  MutationInput,
  QueryInput,
  DirectiveInput,
  UnionInput,
  EnumInput,
  EntityBaseInput,
  FieldBaseInput,
  FieldInput,
  OperationInput,
  RelationBaseInput,
  BelongsToInput,
  BelongsToManyInput,
  HasOneInput,
  HasManyInput,
} from './input';
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
  EntityBaseMeta,
  EnumItemMeta,
  MixinMeta,
  ComplextFieldMeta,
  RelationFieldMeta,
} from './metadata';
/**
 * updatable items
 */
export interface IUpdatable<T extends BaseMeta, K extends MetadataInput<T>> {
  /**
   * update item with data
   * @param payload the update payload
   */
  updateWith(payload: K): void;
  /**
   * return copy of object item that is suitable for creating new one
   */
  toObject(): K;
}

/**
 * Meta interface for updating items with metadata
 */
export interface IMeta<T extends BaseMeta, K extends MetadataInput<T>>
  extends IUpdatable<T, K> {
  /**
   * meta information that is outside of model notations and can be customized as well
   */
  readonly metadata: T;
}

/**
 * the base model item
 */
export interface IModelBase<T extends ModelMeta, K extends MetadataInput<T>>
  extends IMeta<T, K>,
    IValidate {
  /**
   * the kind of current item
   */
  readonly modelType: MetaModelType;
  /**
   * name of modeled item
   */
  readonly name: string;
  /**
   * possible title
   */
  readonly title: string;
  /**
   * description
   */
  readonly description: string;
}
/**
 * the meta model of an application
 */
export interface IModel extends IModelBase<ModelMeta, MetaModelInput> {
  /**
   * set of packages within model
   */
  readonly packages: Map<string, IPackage>;
}
/**
 * Modeled package
 */
export interface IPackage extends IModelBase<PackageMeta, ModelPackageInput> {
  /**
   * is it is abstract
   */
  readonly abstract: boolean;
  /**
   * owner model
   */
  readonly metaModel: IModel;
  /**
   * set of entities
   */
  readonly entities: Map<string, IEntity>;
  /**
   * set of scalars
   */
  readonly scalars: Map<string, IScalar>;
  /**
   * set of mixins
   */
  readonly mixins: Map<string, IMixin>;
  /**
   * set of enums
   */
  readonly enums: Map<string, IEnum>;
  /**
   * set of unions
   */
  readonly unions: Map<string, IUnion>;
  /**
   * set of mutations
   */
  readonly mutations: Map<string, IMutation>;
  /**
   * available user queries
   */
  readonly queries: Map<string, IQuery>;
  /**
   * directives
   */
  readonly directives: Map<string, IDirective>;
}
/**
 * scalar item
 */
export interface IScalar extends IModelBase<ScalarMeta, ScalarInput> {}

/**
 * mutation item
 */
export interface IMutation extends IModelBase<MutationMeta, MutationInput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, FieldArgs>;
}

/**
 * Query definition
 */
export interface IQuery extends IModelBase<QueryMeta, QueryInput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, FieldArgs>;
}
/**
 * Directive definition
 */
export interface IDirective extends IModelBase<DirectiveMeta, DirectiveInput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * where it can met
   */
  readonly on: DirectiveLocation[];
}

/**
 * union definition
 */
export interface IUnion extends IModelBase<UnionMeta, UnionInput> {
  /**
   * item list
   */
  readonly items: Set<string>;
}

/**
 * Enum definitions
 */
export interface IEnum extends IModelBase<EnumMeta, EnumInput> {
  /**
   * Enum item definition
   */
  items: Map<string, IEnumItems>;
}
/**
 * enumItem definition
 */
export interface IEnumItems extends IModelBase<EnumItemMeta, EnumItemInput> {
  /**
   * value
   */
  value: string;
}
/**
 * base for entity like items
 */
export interface IEntityBase<T extends EntityBaseMeta>
  extends IModelBase<EntityMeta, EntityBaseInput<T>> {
  /**
   * plural name for collection
   */
  plural: string;
  /**
   * title for pural
   */
  titlePlural: string;
  /**
   * set of fields
   */
  fields: Map<string, IField>;
}

/**
 * Interface definition
 */
export interface IMixin extends IEntityBase<MixinMeta> {}
/**
 * Entity definitions
 */
export interface IEntity extends IEntityBase<EntityMeta> {
  /**
   * set of interfaces/Mixin it is implement
   * so it is has no own methods to be received from storage
   */
  implements: Set<string>;
  /**
   * is this entity is only embedded into other entity
   */
  embedded: boolean;
  /**
   * entities it is embedded into
   */
  embeddedInto: Set<string>;
  /**
   * is this entity is abstract and can be used for descending from
   */
  abstract: boolean;
}

/**
 * the base for field-like items
 */
export interface IFieldBase<
  T extends FieldBaseMeta,
  K extends FieldBaseInput<T>
> extends IModelBase<T, K> {
  /**
   * set of arguments
   */
  args: Map<string, FieldArgs>;
  /**
   * is it field inherited from other entity and which one
   */
  inheritedFrom: string;
}

/**
 * entity field definition
 */
export interface IField extends IFieldBase<FieldMeta, FieldInput> {
  /**
   * is field indexed
   */
  indexed: boolean | string | string[];
  /**
   * if field is used like identity/unique key
   */
  identity: boolean | string | string[];
  /**
   * field type
   */
  type: string;
}

/**
 * entity complex field definition
 */
export interface IComplexField
  extends IFieldBase<FieldMeta, FieldBaseInput<ComplextFieldMeta>> {
  /**
   * is field indexed
   */
  indexed: boolean | string | string[];
  /**
   * if field is used like identity/unique key
   */
  identity: boolean | string | string[];
  /**
   * field type
   */
  type: ComplexType;
}

/**
 * relation field definition
 */
export interface IRelationField<
  T extends RelationFieldMeta,
  I extends FieldBaseInput<T>,
  RT extends RelationMeta,
  RI extends RelationBaseInput<RT>
> extends IFieldBase<T, I> {
  /**
   * relation definition
   */
  relation: IRelation<RT, RI>;
}

/**
 * entity operation definition
 * used for Entity specific mutations
 */
export interface IOperation extends IFieldBase<OperationMeta, OperationInput> {
  /**
   * action type
   * CRUD
   */
  actionType: OperationKind;
}

/**
 * base Relation for relation definition
 */
export interface IRelation<
  T extends RelationMeta,
  K extends RelationBaseInput<T>
> extends IMeta<T, K> {
  /**
   * the verb of relation
   */
  verb: RelationType;
  /**
   * the reference to specific entity
   */
  ref: IEntityRef;
  /**
   * set of fields
   */
  fields: Map<string, IField>;
  /**
   * the opposite field
   */
  opposite?: string;
}

/**
 * BelongsToMany relation definition
 * the part of many to many relation
 */
export interface IBelongsToManyRelation
  extends IRelation<BelongsToManyMeta, BelongsToManyInput> {
  using?: IEntityRef;
  belongsToMany: IEntityRef;
}

/**
 * BelongsTo relation definition
 * the part of one to many relation which is store reference key
 */
export interface IBelongsToRelation
  extends IRelation<BelongsToMeta, BelongsToInput> {
  belongsTo: IEntityRef;
}

/**
 * HasOne relation definition
 * the part of one to one relation which is not storing the key
 */
export interface IHasOneRelation extends IRelation<HasOneMeta, HasOneInput> {
  hasOne: IEntityRef;
}

/**
 * HasMany definition
 * the part of one to many relation the many side
 */
export interface IHasManyRelation extends IRelation<HasManyMeta, HasManyInput> {
  hasMany: IEntityRef;
}

/**
 * entity reference
 */
export interface IEntityRef {
  /**
   * the backed field
   * field that in owner of the reference is storing the key
   */
  backField: string;
  /**
   * referencing entity
   */
  entity: string;
  /**
   * referencing key field
   */
  field: string;
}

// export type ModelItem =
//   | IModel
//   | IPackage
//   | IEntity
//   | IField
//   | IRelation<RelationMeta>;

// export type Relation =
//   | IHasManyRelation
//   | IHasOneRelation
//   | IBelongsToRelation
//   | IBelongsToRelation;

// export function isModel(item: ModelItem): item is IModel {
//   return item.modelType === 'model';
// }

// export function isPackage(item: ModelItem): item is IPackage {
//   return item.modelType === 'package';
// }

// export function isEntity(item: ModelItem): item is IEntity {
//   return item.modelType === 'entity';
// }

// export function isField(item: ModelItem): item is IField {
//   return item.modelType === 'field';
// }

// export function isRelation<T extends RelationMeta>(
//   item: ModelItem,
// ): item is IRelation<T> {
//   return (
//     item.modelType === 'BelongsTo' ||
//     item.modelType === 'BelongsToMany' ||
//     item.modelType === 'HasOne' ||
//     item.modelType === 'HasMany'
//   );
// }

// export function IsBelongsTo(item: Relation): item is IBelongsToRelation {
//   return isRelation(item) && item.modelType === 'BelongsTo';
// }

// export function IsBelongsToMany(item: Relation): item is IBelongsToRelation {
//   return isRelation(item) && item.modelType === 'BelongsToMany';
// }

// export function IsHasOne(item: Relation): item is IBelongsToRelation {
//   return isRelation(item) && item.modelType === 'HasOne';
// }

// export function IsHasMany(item: Relation): item is IBelongsToRelation {
//   return isRelation(item) && item.modelType === 'HasMany';
// }
