import {
  ModelBase,
  ModelBaseInput,
  ModelBaseStorage,
  IModelBase,
} from './modelbase';
import { merge } from 'lodash';
import { MetaModelType } from './model';
import { BaseMeta } from './metadata';

export interface IEnumItem extends IModelBase<EnumItemMeta, EnumItemInput> {
  value?: string;
}

export interface EnumItemMeta extends BaseMeta {}

export interface EnumItemStorage extends ModelBaseStorage<EnumItemMeta> {
  value?: string;
}

export interface EnumItemInput extends ModelBaseInput<EnumItemMeta> {
  value?: string;
}

export class EnumItem
  extends ModelBase<EnumItemMeta, EnumItemInput, EnumItemStorage>
  implements IEnumItem {
  public modelType: MetaModelType = 'enum-item';
  constructor(inp: EnumItemInput) {
    super(inp);
  }
  get value(): string | undefined {
    return this.$obj.value;
  }
  updateWith(inp: Partial<EnumItemInput>) {
    super.updateWith(inp);
    if (inp.value) {
      this.$obj.value = inp.value;
    }
  }
  toObject(): EnumItemInput {
    return merge({}, super.toObject(), { value: this.value });
  }
}
