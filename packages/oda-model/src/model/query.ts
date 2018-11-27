import {
  FieldArgs,
  QueryInput,
  QueryStorage,
  QueryMeta,
  MetaModelType,
  HashToMap,
  MapToHash,
} from './interfaces';
import { ModelBase } from './modelbase';
import { IQuery } from './interfaces/model';

export class Query extends ModelBase<QueryMeta, QueryInput, QueryStorage>
  implements IQuery {
  public modelType: MetaModelType = 'query';
  public get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  public updateWith(obj: QueryInput) {
    if (obj) {
      super.updateWith(obj);
      this.$obj.args = HashToMap(obj.args);
      this.$obj.payload = HashToMap(obj.payload);
    }
  }

  public toObject(): QueryInput {
    return {
      ...super.toObject(),
      args: MapToHash(this.$obj.args),
      payload: MapToHash(this.$obj.payload),
    };
  }
}
