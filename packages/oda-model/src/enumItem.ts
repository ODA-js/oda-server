import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
} from './modelbase';
import { merge } from 'lodash';
import { MetaModelType, Nullable, assignValue } from './model';
import { ElementMetaInfo } from './element';

export interface IEnumItem extends IModelBase<EnumItemMetaInfo, EnumItemInput> {
  value?: string;
}

export interface EnumItemMetaInfo extends ElementMetaInfo {}

export interface EnumItemInternal extends ModelBaseInternal<EnumItemMetaInfo> {
  value?: string;
}

export interface EnumItemInput extends ModelBaseInput<EnumItemMetaInfo> {
  value?: string;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class EnumItem
  extends ModelBase<EnumItemMetaInfo, EnumItemInput, EnumItemInternal>
  implements IEnumItem {
  public modelType: MetaModelType = 'enum-item';

  constructor(inp: EnumItemInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  get value(): string | undefined {
    return this.$obj.value;
  }

  updateWith(input: Nullable<EnumItemInput>) {
    super.updateWith(input);
    assignValue<EnumItemInternal, EnumItemInput, EnumItemInput['value']>({
      src: this.$obj,
      input,
      field: 'value',
    });
  }

  toObject(): EnumItemInput {
    return merge({}, super.toObject(), { value: this.value });
  }
}
