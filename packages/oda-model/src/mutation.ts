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
import { IObjectTypeField, ObjectTypeFieldInput } from './objecttypefield';
import { IObjectType, ObjectTypeInput } from './objecttype';

export interface IMutation
  extends IModelBase<MutationMetaInfo, MutationInput, MutationOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IObjectType | IObjectTypeField>;
  /**
   * set of output fields
   */
  readonly payload:
    | string
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
}

export interface MutationMetaInfo extends ModelBaseMetaInfo {
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface MutationInternal extends ModelBaseInternal {
  args: Map<string, IObjectType | IObjectTypeField>;
  payload:
    | string
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
}

export interface MutationInput extends ModelBaseInput<MutationMetaInfo> {
  args:
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | ObjectTypeInput
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
}

export interface MutationOutput extends ModelBaseOutput<MutationMetaInfo> {
  args: NamedArray<ObjectTypeFieldInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | ObjectTypeInput
    | NamedArray<ObjectTypeFieldInput>;
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

  public get args(): Map<string, IObjectType | IObjectTypeField> {
    return this[Internal].args;
  }

  public get payload():
    | string
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField> {
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
