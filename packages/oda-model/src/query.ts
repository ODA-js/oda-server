import { merge } from 'lodash';
import { ElementMetaInfo, Internal } from './element';
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
} from './modelbase';
import decapitalize from './lib/decapitalize';

export interface IQuery
  extends IModelBase<QueryMetaInfo, QueryInput, QueryOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IFieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, IFieldArgs>;
}

export interface QueryMetaInfo extends ElementMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal {
  args: Map<string, IFieldArgs>;
  payload: Map<string, IFieldArgs>;
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

  public get args(): Map<string, IFieldArgs> {
    return this[Internal].args;
  }

  public get payload(): Map<string, IFieldArgs> {
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
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
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
