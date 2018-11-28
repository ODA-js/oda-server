import { merge } from 'lodash';
import { BaseMeta } from './metadata';
import {
  FieldArgs,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
} from './model';
import {
  IModelBase,
  ModelBaseStorage,
  ModelBaseInput,
  ModelBase,
} from './modelbase';

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

export interface MutationMeta extends BaseMeta {}

export interface MutationStorage extends ModelBaseStorage<MutationMeta> {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}

export interface MutationInput extends ModelBaseInput<MutationMeta> {
  args: AsHash<FieldArgs>;
  payload: AsHash<FieldArgs>;
}

export class Mutation
  extends ModelBase<MutationMeta, MutationInput, MutationStorage>
  implements IMutation {
  public modelType: MetaModelType = 'mutation';
  public get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  public updateWith(obj: Partial<MutationInput>) {
    super.updateWith(obj);
    if (obj.args) {
      this.$obj.args = HashToMap(obj.args);
    }
    if (obj.payload) {
      this.$obj.payload = HashToMap(obj.payload);
    }
  }

  public toObject(): MutationInput {
    return merge({}, super.toObject(), {
      args: MapToHash(this.$obj.args),
      payload: MapToHash(this.$obj.payload),
    });
  }
}
