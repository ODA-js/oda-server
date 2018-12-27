import { merge } from 'lodash';
import { Internal } from './element';
import {
  IFieldArgs,
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
  ModelBaseMetaInfo,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { IArgs, Args } from './args';

export interface IQuery
  extends IModelBase<QueryMetaInfo, QueryInput, QueryOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, IArgs>;
}

export interface QueryMetaInfo extends ModelBaseMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal {
  args: Map<string, IArgs>;
  payload: Map<string, IArgs>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
  payload: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
}

export interface QueryOutput extends ModelBaseOutput<QueryMetaInfo> {
  args: NamedArray<IFieldArgs>;
  payload: NamedArray<IFieldArgs>;
}

export const queryDefaultMetaInfo = {
  acl: {
    execute: [],
  },
};
export const queryDefaultInput = { metadata: queryDefaultMetaInfo };

export class Query
  extends ModelBase<QueryMetaInfo, QueryInput, QueryInternal, QueryOutput>
  implements IQuery {
  public get modelType(): MetaModelType {
    return 'query';
  }

  constructor(init: QueryInput) {
    super(merge({}, queryDefaultInput, init));
  }

  public get args(): Map<string, IArgs> {
    return this[Internal].args;
  }

  public get payload(): Map<string, IArgs> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<QueryInput>) {
    super.updateWith(input);

    assignValue<QueryInternal, QueryInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value)),
      required: true,
    });

    assignValue<
      QueryInternal,
      QueryInput,
      AsHash<IFieldArgs> | NamedArray<IFieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value, v => new Args(v))
          : HashToMap(value, (name, v) => new Args({ name, ...v }))),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<
      QueryInternal,
      QueryInput,
      AsHash<IFieldArgs> | NamedArray<IFieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload = Array.isArray(value)
          ? ArrayToMap(value, v => new Args(v))
          : HashToMap(value, (name, v) => new Args({ name, ...v }))),
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): QueryOutput {
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload: MapToArray(this[Internal].payload, (_name, value) =>
        value.toObject(),
      ),
    } as Partial<QueryOutput>);
  }
  public mergeWith(payload: Nullable<QueryInput>) {
    super.mergeWith(payload);
  }
}
