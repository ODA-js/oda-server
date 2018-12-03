import {
  HasMany,
  HasManyInput,
  HasManyInternal,
  HasManyMetaInfo,
  IHasManyRelation,
} from './hasmany';
import {
  HasOne,
  HasOneInput,
  HasOneInternal,
  HasOneMetaInfo,
  IHasOneRelation,
} from './hasone';
import {
  BelongsTo,
  BelongsToInput,
  BelongsToInternal,
  BelongsToMetaInfo,
  IBelongsToRelation,
} from './belongsto';
import {
  BelongsToMany,
  BelongsToManyInput,
  BelongsToManyInternal,
  BelongsToManyMetaInfo,
  IBelongsToManyRelation,
} from './belongstmany';

export type IRelation =
  | IHasOneRelation
  | IHasManyRelation
  | IBelongsToManyRelation
  | IBelongsToRelation;

export type Relation = HasMany | HasOne | BelongsTo | BelongsToMany;

export type RelationInput =
  | HasOneInput
  | HasManyInput
  | BelongsToInput
  | BelongsToManyInput;

export type RelationInternal =
  | HasManyInternal
  | HasOneInternal
  | BelongsToInternal
  | BelongsToManyInternal;

export type RelationMetaInfo =
  | HasOneMetaInfo
  | HasManyMetaInfo
  | BelongsToManyMetaInfo
  | BelongsToMetaInfo;
