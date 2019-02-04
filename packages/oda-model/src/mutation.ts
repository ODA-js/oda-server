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
    | IRecord
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
  payload:
    | string
    | EnumType
    | EntityType
    | IRecord
    | Map<string, IRecord | IRecordField>;
}

export interface MutationInput extends ModelBaseInput<MutationMetaInfo> {
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

export interface MutationOutput extends ModelBaseOutput<MutationMetaInfo> {
  args: NamedArray<RecordFieldInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | RecordInput
    | NamedArray<RecordFieldInput>;
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
    | IRecord
    | Map<string, IRecord | IRecordField> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<MutationInput>) {
    super.updateWith(input);

    assignValue<MutationInternal, MutationInput, MutationInput['name']>({
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
      effect: applyArgs,
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<MutationInternal, MutationInput, MutationInput['payload']>({
      src: this[Internal],
      input,
      field: 'payload',
      effect: applyPayload,
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): MutationOutput {
    const internal = this[Internal];
    const payload = payloadToObject(internal);
    return merge({}, super.toObject(), {
      args: MapToArray(internal.args, (_name, value) => value.toObject()),
      payload,
    } as Partial<MutationOutput>);
  }

  public mergeWith(payload: Nullable<MutationInput>) {
    super.mergeWith(payload);
  }
}
