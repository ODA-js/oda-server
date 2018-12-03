import {
  IRelation,
  RelationBasePersistence,
  RelationBaseMetaInfo,
  RelationBaseInput,
  RelationBaseInternal,
  RelationBase,
} from './relationbase';
import { IEntityRef, EntityReference } from './entityreference';
import { merge, set } from 'lodash';
import { assignValue } from './model';

export interface HasManyPersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface IHasManyRelation
  extends IRelation<HasManyMetaInfo, HasManyInput, HasManyPersistence> {
  hasMany: IEntityRef;
}

export interface HasManyMetaInfo
  extends RelationBaseMetaInfo<HasManyPersistence> {}

export interface HasManyInternal
  extends RelationBaseInternal<HasManyMetaInfo, HasManyPersistence> {
  hasMany: IEntityRef;
}

export interface HasManyInput
  extends RelationBaseInput<HasManyMetaInfo, HasManyPersistence> {
  hasMany: string;
}

const defaultMetaInfo = {
  verb: 'HasMany',
  persistence: {
    single: false,
    stored: false,
    embedded: false,
  },
};
const defaultInternal = {};
const defaultInput = {};

export class HasMany extends RelationBase<
  HasManyMetaInfo,
  HasManyInput,
  HasManyInternal,
  HasManyPersistence
> {
  get hasMany(): IEntityRef {
    return this.$obj.hasMany;
  }

  get ref(): IEntityRef {
    return this.$obj.hasMany;
  }

  constructor(inp: HasManyInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: HasManyInput) {
    super.updateWith(input);

    assignValue<HasManyMetaInfo, HasManyInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => set(src, 'persistence.embedded', value),
    });

    assignValue<HasManyInternal, HasManyInput, string>({
      src: this.$obj,
      input,
      field: 'hasMany',
      effect: (src, value) => {
        src.hasMany = new EntityReference(value);
        if (!src.hasMany.backField) {
          src.hasMany.backField = 'id';
        }
      },
    });
  }

  // it get fixed object
  public toObject(): HasManyInput {
    return merge({}, super.toObject(), {
      hasMany: this.hasMany.toString(),
    });
  }
}
