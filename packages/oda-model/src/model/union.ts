import clean from '../lib/json/clean';
import { MetaModelType, UnionStorage, UnionInput } from './interfaces';
import { ModelBase } from './modelbase';
import { IUnion } from './interfaces/model';

export class Union extends ModelBase implements IUnion {
  public modelType: MetaModelType = 'union';
  protected $obj!: UnionStorage;

  get items(): string[] {
    return this.$obj.items;
  }

  public updateWith(obj: UnionInput) {
    if (obj) {
      super.updateWith(obj);
      this.$obj = {
        ...this.$obj,
        ...obj,
      };
    }
  }

  public toObject() {
    return this.$obj;
  }
}
