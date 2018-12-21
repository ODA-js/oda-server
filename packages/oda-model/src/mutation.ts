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

export interface IMutation
  extends IModelBase<MutationMetaInfo, MutationInput, MutationOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, FieldArgs>;
}

export interface MutationMetaInfo extends ElementMetaInfo {
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface MutationInternal extends ModelBaseInternal {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
}

export interface MutationInput extends ModelBaseInput<MutationMetaInfo> {
  args: AsHash<FieldArgs> | NamedArray<FieldArgs>;
  payload: AsHash<FieldArgs> | NamedArray<FieldArgs>;
}

export interface MutationOutput extends ModelBaseOutput<MutationMetaInfo> {
  args: NamedArray<FieldArgs>;
  payload: NamedArray<FieldArgs>;
}

const defaultMetaInfo = { acl: { execute: [] } };
const defaultInput = { metadata: defaultMetaInfo };

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
    super(merge({}, defaultInput, init));
  }

  public get args(): Map<string, FieldArgs> {
    return this[Internal].args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<MutationInput>) {
    super.updateWith(input);
    assignValue<MutationInternal, MutationInput, MutationInput['args']>({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<MutationInternal, MutationInput, MutationInput['payload']>({
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

  public toObject(): MutationOutput {
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (name, value) => ({
        ...value,
        name,
      })),
      payload: MapToArray(this[Internal].payload, (name, value) => ({
        ...value,
        name,
      })),
    } as Partial<MutationOutput>);
  }
}
