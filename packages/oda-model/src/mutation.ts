import { merge } from 'lodash';
import { ElementMetaInfo } from './element';
import {
  FieldArgs,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
  Nullable,
  assignValue,
} from './model';
import {
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBase,
} from './modelbase';

export interface IMutation extends IModelBase<MutationMetaInfo, MutationInput> {
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
  args: AsHash<FieldArgs>;
  payload: AsHash<FieldArgs>;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Mutation
  extends ModelBase<MutationMetaInfo, MutationInput, MutationInternal>
  implements IMutation {
  public modelType: MetaModelType = 'mutation';

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
      effect: (src, value) => (src.args = HashToMap(value)),
      required: true,
    });

    assignValue<MutationInternal, MutationInput, MutationInput['payload']>({
      src: this.$obj,
      input,
      field: 'payload',
      effect: (src, value) => (src.args = HashToMap(value)),
      required: true,
    });
  }

  public toObject(): MutationInput {
    return merge({}, super.toObject(), {
      args: MapToHash(this.$obj.args),
      payload: MapToHash(this.$obj.payload),
    });
  }
}
