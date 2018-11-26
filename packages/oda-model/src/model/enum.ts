import clean from '../lib/json/clean';
import { MetaModelType, EnumStorage, EnumInput } from './interfaces';
import { ModelBase } from './modelbase';
import { IEnum, IEnumItemsInput } from './interfaces/model';

export class Enum extends ModelBase implements IEnum {
  public modelType: MetaModelType = 'union';
  protected $obj!: EnumStorage;

  get items(): IEnumItemsInput[] {
    return this.$obj.items;
  }

  public updateWith(obj: EnumInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };
      result.name = obj.name;
      let $items = obj.items;
      let items = $items;

      result.items = items
        .map(i => (typeof i === 'string' ? { name: i } : i))
        .map(i => ({
          name: i.name,
          title: i.title || i.name,
          description: i.description || i.title || i.name,
          value: i.value,
          metadata: i.metadata,
        }));

      result.items_ = $items;

      this.$obj = result;
    }
  }

  // it get fixed object
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      items: props.items,
    });
  }
}
