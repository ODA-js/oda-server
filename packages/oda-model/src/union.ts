import { merge } from 'lodash';
import { ElementMetaInfo } from './element';
import {
  ModelBaseInternal,
  ModelBaseInput,
  ModelBase,
  IModelBase,
  ModelBaseOutput,
} from './modelbase';
import { MetaModelType, Nullable, assignValue } from './types';

/**
 * union definition
 */
export interface IUnion
  extends IModelBase<UnionMetaInfo, UnionInput, UnionOutput> {
  /**
   * item list
   */
  readonly items: Set<string>;
}

export interface UnionMetaInfo extends ElementMetaInfo {}

export interface UnionInternal extends ModelBaseInternal<UnionMetaInfo> {
  items: Set<string>;
}

export interface UnionInput extends ModelBaseInput<UnionMetaInfo> {
  items: string[];
}

export interface UnionOutput extends ModelBaseOutput<UnionMetaInfo> {
  items: string[];
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Union
  extends ModelBase<UnionMetaInfo, UnionInput, UnionInternal, UnionOutput>
  implements IUnion {
  public modelType: MetaModelType = 'union';
  constructor(inp: UnionInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }
  get items(): Set<string> {
    return this.$obj.items;
  }

  public updateWith(input: Nullable<UnionInput>) {
    super.updateWith(input);
    assignValue<UnionInternal, UnionInput, UnionInput['items']>({
      src: this.$obj,
      input,
      field: 'items',
      effect: (src, value) => (src.items = new Set(value)),
      required: true,
      setDefault: src => (src.items = new Set()),
    });
  }

  public toObject(): UnionOutput {
    return merge({}, super.toObject(), { items: [...this.items] } as Partial<
      UnionOutput
    >);
  }
}
