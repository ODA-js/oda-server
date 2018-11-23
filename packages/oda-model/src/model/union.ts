import clean from '../lib/json/clean';
import { MetaModelType, UnionStorage, UnionInput } from './interfaces';
import { ModelBase } from './modelbase';

export class Union extends ModelBase {
  public modelType: MetaModelType = 'union';
  protected $obj!: UnionStorage;

  get items(): string[] {
    return this.$obj.items;
  }

  public updateWith(obj: UnionInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };
      result.name = obj.name;

      let $items = obj.items;
      let items = $items;

      result.items = items;
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
      items: props.items || props.items_,
    });
  }

  // it get clean object with no default values
  public toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      items: props.items_,
    });
  }
}
