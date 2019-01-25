import { merge } from 'lodash';
import { Internal } from './element';
import {
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  NamedArray,
  ArrayToMap,
  MapToArray,
  HashToArray,
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
import { IArgs, Args, ArgsInput } from './args';

export interface IQuery
  extends IModelBase<QueryMetaInfo, QueryInput, QueryOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IArgs>;
  /**
   * set of output fields
   */
  readonly payload: string | Map<string, IArgs>;
}

export interface QueryMetaInfo extends ModelBaseMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal {
  args: Map<string, IArgs>;
  payload: string | Map<string, IArgs>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args: AsHash<ArgsInput> | NamedArray<ArgsInput>;
  payload: string | AsHash<ArgsInput> | NamedArray<ArgsInput>;
}

export interface QueryOutput extends ModelBaseOutput<QueryMetaInfo> {
  args: NamedArray<ArgsInput>;
  payload: string | NamedArray<ArgsInput>;
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

  public get payload(): string | Map<string, IArgs> {
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
      AsHash<ArgsInput> | NamedArray<ArgsInput>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          i => new Args(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        )),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<
      QueryInternal,
      QueryInput,
      AsHash<ArgsInput> | NamedArray<ArgsInput>
    >({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload = ArrayToMap(
          typeof value === 'string'
            ? value
            : Array.isArray(value)
            ? value
            : HashToArray(value),
          i => new Args(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        )),
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): QueryOutput {
    const internal = this[Internal];
    const payload =
      typeof internal.payload === 'string'
        ? internal.payload
        : MapToArray(internal.payload, (_name, value) => value.toObject());
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload,
    } as Partial<QueryOutput>);
  }
  public mergeWith(payload: Nullable<QueryInput>) {
    super.mergeWith(payload);
  }
}
