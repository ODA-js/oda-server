import { merge } from 'lodash';
import { BaseMeta } from './metadata';
import {
  ModelBaseStorage,
  ModelBaseInput,
  ModelBase,
  IModelBase,
} from './modelbase';
import { MetaModelType } from './model';

/**
 * union definition
 */
export interface IUnion extends IModelBase<UnionMeta, UnionInput> {
  /**
   * item list
   */
  readonly items: Set<string>;
}

export interface UnionMeta extends BaseMeta {}

export interface UnionStorage extends ModelBaseStorage<UnionMeta> {
  items: Set<string>;
}

export interface UnionInput extends ModelBaseInput<UnionMeta> {
  items: string[];
}

export class Union extends ModelBase<UnionMeta, UnionInput, UnionStorage>
  implements IUnion {
  public modelType: MetaModelType = 'union';
  constructor(inp: UnionInput) {
    super(inp);
  }
  get items(): Set<string> {
    return this.$obj.items;
  }

  public updateWith(obj: Partial<UnionInput>) {
    super.updateWith(obj);
    if (obj.items) {
      this.$obj.items = new Set(obj.items);
    }
  }

  public toObject(): UnionInput {
    return merge({}, super.toObject(), { items: [...this.items] });
  }
}
