import { MetaModelInput, ModelPackageInput, EntityBaseInput } from './input';
import { PackageMeta, EntityMeta, EntityBaseMeta, MixinMeta } from './metadata';

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
 * Enum definitions
 */

/**
 * enumItem definition
 */

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
  fields: Map<string, ISimpleField>;
}

/**
 * Interface definition
 */
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

/**
 * entity field definition
 */

/**
 * entity reference
 */

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
