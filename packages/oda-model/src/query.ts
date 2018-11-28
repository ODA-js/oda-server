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

export interface QueryMeta extends BaseMeta {}

export interface QueryStorage extends ModelBaseStorage<QueryMeta> {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}

export interface QueryInput extends ModelBaseInput<QueryMeta> {
  args: AsHash<FieldArgs>;
  payload: AsHash<FieldArgs>;
}

export class Query extends ModelBase<QueryMeta, QueryInput, QueryStorage>
  implements IQuery {
  public modelType: MetaModelType = 'query';
  public get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  public updateWith(obj: Partial<QueryInput>) {
    super.updateWith(obj);
    if (obj.args) {
      this.$obj.args = HashToMap(obj.args);
    }
    if (obj.payload) {
      this.$obj.payload = HashToMap(obj.payload);
    }
  }

  public toObject(): QueryInput {
    return merge({}, super.toObject(), {
      args: MapToHash(this.$obj.args),
      payload: MapToHash(this.$obj.payload),
    });
  }
}
