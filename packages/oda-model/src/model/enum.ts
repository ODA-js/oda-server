import clean from '../lib/json/clean';
import {
  MetaModelType,
  EnumStorage,
  EnumInput,
  EnumMeta,
  EnumItemInput,
} from './interfaces';
import { ModelBase } from './modelbase';
import { IEnum, IEnumItem } from './interfaces/model';
import { EnumItem } from './enumItem';

export class Enum extends ModelBase<EnumMeta, EnumInput, EnumStorage>
  implements IEnum {
  public modelType: MetaModelType = 'union';
  get items() {
    return this.$obj.items;
  }

  public updateWith(obj: EnumInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };
      result.name = obj.name;
      let $items = obj.items;
      let items = $items;

      result.items = new Map(
        items
          .map(i =>
            typeof i === 'string' ? ({ name: i } as EnumItemInput) : i,
          )
          .map(
            i =>
              [
                i.name,
                new EnumItem({
                  name: i.name,
                  title: i.title || i.name,
                  description: i.description || i.title || i.name,
                  value: i.value,
                  metadata: i.metadata,
                }),
              ] as [string, IEnumItem],
          ),
      );

      this.$obj = result;
    }
  }

  public toObject(): EnumInput {
    return {
      ...super.toObject(),
      items: [...this.$obj.items.values()].map(i => i.toObject()),
    };
  }
}
