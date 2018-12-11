import {
  IRelationBase,
  RelationBasePersistence,
  RelationBaseMetaInfo,
  RelationBaseInput,
  RelationBaseInternal,
  RelationBase,
  RelationBaseOutput,
} from './relationbase';
import { IEntityRef, EntityReference } from './entityreference';
import { merge } from 'lodash';
import { assignValue, Nullable } from './types';

export interface HasManyPersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface IHasManyRelation
  extends IRelationBase<
    HasManyMetaInfo,
    HasManyInput,
    HasManyPersistence,
    HasManyOutput
  > {
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

export interface HasManyOutput
  extends RelationBaseOutput<HasManyMetaInfo, HasManyPersistence> {
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
  HasManyPersistence,
  HasManyOutput
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
    this.initNames();
  }

  public updateWith(input: Nullable<HasManyInput>) {
    super.updateWith(input);

    assignValue<HasManyMetaInfo, HasManyInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => (src.persistence.embedded = value),
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
  public toObject(): HasManyOutput {
    return merge({}, super.toObject(), {
      hasMany: this.hasMany.toString(),
    });
  }
}
