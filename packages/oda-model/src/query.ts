import { merge } from 'lodash';
import { ElementMetaInfo } from './element';
import {
  FieldArgs,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
  Nullable,
  assignValue,
} from './model';
import {
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBase,
} from './modelbase';

export interface IQuery extends IModelBase<QueryMetaInfo, QueryInput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, FieldArgs>;
}

export interface QueryMetaInfo extends ElementMetaInfo {}

export interface QueryInternal extends ModelBaseInternal<QueryMetaInfo> {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args: AsHash<FieldArgs>;
  payload: AsHash<FieldArgs>;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Query extends ModelBase<QueryMetaInfo, QueryInput, QueryInternal>
  implements IQuery {
  public modelType: MetaModelType = 'query';

  constructor(inp: QueryInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  public updateWith(input: Nullable<QueryInput>) {
    super.updateWith(input);

    assignValue<QueryInternal, QueryInput, QueryInput['args']>({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) => (src.args = HashToMap(value)),
      required: true,
    });

    assignValue<QueryInternal, QueryInput, QueryInput['payload']>({
      src: this.$obj,
      input,
      field: 'payload',
      effect: (src, value) => (src.args = HashToMap(value)),
      required: true,
    });
  }

  public toObject(): QueryInput {
    return merge({}, super.toObject(), {
      args: MapToHash(this.$obj.args),
      payload: MapToHash(this.$obj.payload),
    });
  }
}
