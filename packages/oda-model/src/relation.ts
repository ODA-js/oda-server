import { HasMany, HasManyInput } from './hasmany';
import { HasOne, HasOneInput } from './hasone';
import { BelongsTo, BelongsToInput } from './belongsto';
import { BelongsToMany, BelongsToManyInput } from './belongstmany';

export type Relation = HasMany | HasOne | BelongsTo | BelongsToMany;

export type RelationInput =
  | HasOneInput
  | HasManyInput
  | BelongsToInput
  | BelongsToManyInput;
