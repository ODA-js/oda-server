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
  isEnumType,
  isEntityType,
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
  isRecordInput,
  Record,
  isRecord,
  RecordInput,
} from './record';

export interface IMutation
  extends IModelBase<MutationMetaInfo, MutationInput, MutationOutput> {
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

export interface MutationMetaInfo extends ModelBaseMetaInfo {
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface MutationInternal extends ModelBaseInternal {
  args: Map<string, IRecord | IRecordField>;
  payload: string | EnumType | EntityType | Map<string, IRecord | IRecordField>;
}

export interface MutationInput extends ModelBaseInput<MutationMetaInfo> {
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

export interface MutationOutput extends ModelBaseOutput<MutationMetaInfo> {
  args: NamedArray<RecordFieldInput>;
  payload: string | EnumType | EntityType | NamedArray<RecordFieldInput>;
}

export const mutationDefaultMetaInfo = { acl: { execute: [] } };
export const mutationDefaultInput = { metadata: mutationDefaultMetaInfo };

export class Mutation
  extends ModelBase<
    MutationMetaInfo,
    MutationInput,
    MutationInternal,
    MutationOutput
  >
  implements IMutation {
  public get modelType(): MetaModelType {
    return 'mutation';
  }

  constructor(init: MutationInput) {
    super(merge({}, mutationDefaultInput, init));
  }

  public get args(): Map<string, IRecord | IRecordField> {
    return this[Internal].args;
  }

  public get payload():
    | string
    | EnumType
    | EntityType
    | Map<string, IRecord | IRecordField> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<MutationInput>) {
    super.updateWith(input);

    assignValue<MutationInternal, MutationInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value.trim())),
      required: true,
    });

    assignValue<
      MutationInternal,
      MutationInput,
      NonNullable<MutationInput['args']>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          v => (isRecordInput(v) ? new Record(v) : new RecordField(v)),
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

    assignValue<MutationInternal, MutationInput, MutationInput['payload']>({
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
                v => (isRecordInput(v) ? new Record(v) : new RecordField(v)),
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

  public toObject(): MutationOutput {
    const internal = this[Internal];
    const payload =
      typeof internal.payload === 'string'
        ? internal.payload
        : isEnumType(internal.payload) || isEntityType(internal.payload)
        ? internal.payload
        : MapToArray(internal.payload, (_name, value) => value.toObject());
    return merge({}, super.toObject(), {
      args: MapToArray(internal.args, (_name, value) => value.toObject()),
      payload,
    } as Partial<MutationOutput>);
  }

  public mergeWith(payload: Nullable<MutationInput>) {
    super.mergeWith(payload);
  }
}
