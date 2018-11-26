export interface BaseMeta {}

export interface EntityBaseMeta extends BaseMeta {}
export interface EntityMeta extends EntityBaseMeta {}
export interface MixinMeta extends EntityBaseMeta {}
export interface ModelMeta extends BaseMeta {}
export interface UnionMeta extends BaseMeta {}
export interface ScalarMeta extends BaseMeta {}
export interface MutationMeta extends BaseMeta {}
export interface RelationMeta extends BaseMeta {}
export interface BelongsToManyMeta extends RelationMeta {}
export interface BelongsToMeta extends RelationMeta {}
export interface HasOneMeta extends RelationMeta {}
export interface HasManyMeta extends RelationMeta {}

export interface DirectiveMeta extends BaseMeta {}
export interface EnumMeta extends BaseMeta {}
export interface QueryMeta extends FieldBaseMeta {}
export interface PackageMeta extends BaseMeta {}
export interface FieldBaseMeta extends BaseMeta {}
export interface FieldMeta extends FieldBaseMeta {}
export interface OperationMeta extends FieldBaseMeta {}
