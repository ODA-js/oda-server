import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
  ModelBaseOutput,
} from './modelbase';
import { merge } from 'lodash';
import { MetaModelType, Nullable, assignValue } from './model';
import { ElementMetaInfo } from './element';

export interface IEnumItem
  extends IModelBase<EnumItemMetaInfo, EnumItemInput, EnumItemOutput> {
  value: string;
}

export interface EnumItemMetaInfo extends ElementMetaInfo {}

export interface EnumItemInternal extends ModelBaseInternal<EnumItemMetaInfo> {
  value: string;
}

export interface EnumItemInput extends ModelBaseInput<EnumItemMetaInfo> {
  value?: string;
}
export interface EnumItemOutput extends ModelBaseOutput<EnumItemMetaInfo> {
  value: string;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class EnumItem
  extends ModelBase<
    EnumItemMetaInfo,
    EnumItemInput,
    EnumItemInternal,
    EnumItemOutput
  >
  implements IEnumItem {
  public modelType: MetaModelType = 'enum-item';

  constructor(inp: EnumItemInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  get value(): string {
    return this.$obj.value;
  }

  updateWith(input: Nullable<EnumItemInput>) {
    super.updateWith(input);
    assignValue<EnumItemInternal, EnumItemInput, EnumItemInput['value']>({
      src: this.$obj,
      input,
      field: 'value',
      setDefault: src => (src.value = src.name),
    });
  }

  toObject(): EnumItemOutput {
    return merge({}, super.toObject(), { value: this.value } as Partial<
      EnumItemOutput
    >);
  }
}
