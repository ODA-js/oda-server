import {
  MetaModelType,
  EnumItemMeta,
  EnumItemInput,
  EnumItemStorage,
  IEnumItem,
} from './interfaces';
import { ModelBase } from './modelbase';

export class EnumItem
  extends ModelBase<EnumItemMeta, EnumItemInput, EnumItemStorage>
  implements IEnumItem {
  public modelType: MetaModelType = 'enum-item';
  constructor(inp: EnumItemInput) {
    super(inp);
  }
  get value(): string {
    return this.$obj.value;
  }
  updateWith(inp: EnumItemInput) {
    super.updateWith(inp);
    this.$obj.value = inp.value || '';
  }
  toObject(): EnumItemInput {
    return {
      ...super.toObject(),
      value: this.value,
    };
  }
}
