import { merge } from 'lodash';
import { Internal } from './element';
import {
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  NamedArray,
  MapToArray,
  EnumType,
  EntityType,
} from './types';
import { payloadToObject } from './payloadToObject';
import { applyArgs } from './applyArgs';
import { applyPayload } from './applyPayload';
import {
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBase,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { IRecordField, RecordFieldInput } from './recordfield';
import { IRecord, RecordInput } from './record';

export interface IQuery
  extends IModelBase<QueryMetaInfo, QueryInput, QueryOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IRecord | IRecordField>;
  /**
   * set of output fields
   */
  readonly payload:
    | string
    | EnumType
    | EntityType
    | IRecord
    | Map<string, IRecord | IRecordField>;
}

export interface QueryMetaInfo extends ModelBaseMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal {
  args: Map<string, IRecord | IRecordField>;
  payload:
    | string
    | EnumType
    | EntityType
    | IRecord
    | Map<string, IRecord | IRecordField>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args:
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | RecordInput
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
}

export interface QueryOutput extends ModelBaseOutput<QueryMetaInfo> {
  args: NamedArray<RecordFieldInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | RecordInput
    | NamedArray<RecordFieldInput | RecordInput>;
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

  public get args(): Map<string, IRecord | IRecordField> {
    return this[Internal].args;
  }

  public get payload():
    | string
    | EnumType
    | EntityType
    | IRecord
    | Map<string, IRecord | IRecordField> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<QueryInput>) {
    super.updateWith(input);

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['name']>>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value)),
      required: true,
    });

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['args']>>({
      src: this[Internal],
      input,
      field: 'args',
      effect: applyArgs,
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['payload']>>({
      src: this[Internal],
      input,
      field: 'payload',
      effect: applyPayload,
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): QueryOutput {
    const internal = this[Internal];
    const payload = payloadToObject(internal);
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload,
    } as Partial<QueryOutput>);
  }
  public mergeWith(payload: Nullable<QueryInput>) {
    super.mergeWith(payload);
  }
}
