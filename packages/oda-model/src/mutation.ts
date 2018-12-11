import { merge } from 'lodash';
import { ElementMetaInfo } from './element';
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

export interface MutationMetaInfo extends ElementMetaInfo {}

export interface MutationInternal extends ModelBaseInternal<MutationMetaInfo> {
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

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

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

  constructor(inp: MutationInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  public get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  public updateWith(input: Nullable<MutationInput>) {
    super.updateWith(input);
    assignValue<MutationInternal, MutationInput, MutationInput['args']>({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
    });

    assignValue<MutationInternal, MutationInput, MutationInput['payload']>({
      src: this.$obj,
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
      args: MapToArray(this.$obj.args),
      payload: MapToArray(this.$obj.payload),
    } as Partial<MutationOutput>);
  }
}
