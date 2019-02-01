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
  EnumType,
  EntityType,
  isEntityType,
  isEnumType,
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
import { IRecordField, RecordField, RecordFieldInput } from './recordfield';
import {
  IRecord,
  RecordInput,
  isRecordInput,
  isRecord,
  Record,
} from './record';

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
    | Map<string, IRecord | IRecordField>;
}

export interface QueryMetaInfo extends ModelBaseMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal {
  args: Map<string, IRecord | IRecordField>;
  payload: string | EnumType | EntityType | Map<string, IRecord | IRecordField>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args:
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
}

export interface QueryOutput extends ModelBaseOutput<QueryMetaInfo> {
  args: NamedArray<RecordFieldInput>;
  payload: string | EnumType | EntityType | NamedArray<RecordFieldInput>;
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
      effect: (src, value) =>
        (src.args = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          v =>
            isRecordInput(v)
              ? new Record({ ...v, kind: 'input' })
              : new RecordField({ ...v, kind: 'input' }),
          (obj, src) =>
            isRecord(obj) && isRecord(src)
              ? obj.mergeWith(src.toObject())
              : !isRecord(obj) && !isRecord(src)
              ? obj.mergeWith(src.toObject())
              : obj,
        )),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['payload']>>({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload =
          typeof value === 'string'
            ? value
            : isEnumType(value) || isEntityType(value)
            ? value
            : ArrayToMap(
                Array.isArray(value) ? value : HashToArray(value),
                v =>
                  isRecordInput(v)
                    ? new Record({ ...v, kind: 'output' })
                    : new RecordField({ ...v, kind: 'output' }),
                (obj, src) =>
                  isRecord(obj) && isRecord(src)
                    ? obj.mergeWith(src.toObject())
                    : !isRecord(obj) && !isRecord(src)
                    ? obj.mergeWith(src.toObject())
                    : obj,
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
        : isEnumType(internal.payload) || isEntityType(internal.payload)
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
