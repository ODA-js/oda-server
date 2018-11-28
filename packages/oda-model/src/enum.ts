import {
  ModelBase,
  IModelBase,
  ModelBaseStorage,
  ModelBaseInput,
} from './modelbase';
import { EnumItem, IEnumItem, EnumItemInput } from './enumItem';
import { merge } from 'lodash';
import { BaseMeta } from './metadata';
import { MetaModelType } from './model';

export interface IEnum extends IModelBase<EnumMeta, EnumInput> {
  /**
   * Enum item definition
   */
  items: Map<string, IEnumItem>;
}

export interface EnumMeta extends BaseMeta {}

export interface EnumStorage extends ModelBaseStorage<EnumMeta> {
  items: Map<string, IEnumItem>;
}

export interface EnumInput extends ModelBaseInput<EnumMeta> {
  items: (EnumItemInput | string)[];
}

export class Enum extends ModelBase<EnumMeta, EnumInput, EnumStorage>
  implements IEnum {
  public modelType: MetaModelType = 'union';
  get items() {
    return this.$obj.items;
  }

  public updateWith(obj: Partial<EnumInput>) {
    super.updateWith(obj);
    if (obj.items) {
      this.$obj.items = new Map(
        obj.items
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
    }
  }

  public toObject(): EnumInput {
    return merge({}, super.toObject(), {
      items: [...this.$obj.items.values()].map(i => i.toObject()),
    });
  }
}
