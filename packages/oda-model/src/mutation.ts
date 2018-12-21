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

export interface IMutation
  extends IModelBase<MutationMetaInfo, MutationInput, MutationOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IFieldArgs>;
  /**
   * set of output fields
   */
  readonly payload: Map<string, IFieldArgs>;
}

export interface MutationMetaInfo extends ElementMetaInfo {
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface MutationInternal extends ModelBaseInternal {
  args: Map<string, IFieldArgs>;
  payload: Map<string, IFieldArgs>;
}

export interface MutationInput extends ModelBaseInput<MutationMetaInfo> {
  args: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
  payload: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
}

export interface MutationOutput extends ModelBaseOutput<MutationMetaInfo> {
  args: NamedArray<IFieldArgs>;
  payload: NamedArray<IFieldArgs>;
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

  public get args(): Map<string, IFieldArgs> {
    return this[Internal].args;
  }

  public get payload(): Map<string, IFieldArgs> {
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
