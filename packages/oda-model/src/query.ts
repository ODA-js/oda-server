import { merge } from 'lodash';
import { ElementMetaInfo, Internal } from './element';
import {
  FieldArgs,
  AsHash,
  MetaModelType,
  HashToMap,
  Nullable,
  assignValue,
  NamedArray,
  ArrayToMap,
  MapToArray,
} from './types';
import {
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';

export interface IQuery
  extends IModelBase<QueryMetaInfo, QueryInput, QueryOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, FieldArgs>;
}

export interface QueryMetaInfo extends ElementMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal<QueryMetaInfo> {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args: AsHash<FieldArgs> | NamedArray<FieldArgs>;
  payload: AsHash<FieldArgs> | NamedArray<FieldArgs>;
}

export interface QueryOutput extends ModelBaseOutput<QueryMetaInfo> {
  args: NamedArray<FieldArgs>;
  payload: NamedArray<FieldArgs>;
}

const defaultMetaInfo = {
  acl: {
    execute: [],
  },
};
const defaultInput = { metadata: defaultMetaInfo };

export class Query
  extends ModelBase<QueryMetaInfo, QueryInput, QueryInternal, QueryOutput>
  implements IQuery {
  public get modelType(): MetaModelType {
    return 'query';
  }

  constructor(init: QueryInput) {
    super(merge({}, defaultInput, init));
  }

  public get args(): Map<string, FieldArgs> {
    return this[Internal].args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<QueryInput>) {
    super.updateWith(input);

    assignValue<
      QueryInternal,
      QueryInput,
      AsHash<FieldArgs> | NamedArray<FieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
    });

    assignValue<
      QueryInternal,
      QueryInput,
      AsHash<FieldArgs> | NamedArray<FieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
    });
  }

  public toObject(): QueryOutput {
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (name, value) => ({
        ...value,
        name,
      })),
      payload: MapToArray(this[Internal].payload, (name, value) => ({
        ...value,
        name,
      })),
    } as Partial<QueryOutput>);
  }
}
