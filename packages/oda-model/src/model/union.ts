import {
  MetaModelType,
  UnionStorage,
  UnionInput,
  UnionMeta,
} from './interfaces';
import { ModelBase } from './modelbase';
import { IUnion } from './interfaces/model';

export class Union extends ModelBase<UnionMeta, UnionInput, UnionStorage>
  implements IUnion {
  public modelType: MetaModelType = 'union';
  constructor(inp: UnionInput) {
    super(inp);
  }
  get items(): Set<string> {
    return this.$obj.items;
  }

  public updateWith(obj: UnionInput) {
    super.updateWith(obj);
    this.$obj.items = new Set(obj.items);
  }

  public toObject(): UnionInput {
    return {
      ...super.toObject(),
      items: [...this.items],
    };
  }
}
