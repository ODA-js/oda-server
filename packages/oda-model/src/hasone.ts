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

export interface HasOnePersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface IHasOneRelation
  extends IRelation<HasOneMetaInfo, HasOneInput, HasOnePersistence> {
  hasOne: IEntityRef;
}

export interface HasOneMetaInfo
  extends RelationBaseMetaInfo<HasOnePersistence> {}

export interface HasOneInternal
  extends RelationBaseInternal<HasOneMetaInfo, HasOnePersistence> {
  hasOne: IEntityRef;
}

export interface HasOneInput
  extends RelationBaseInput<HasOneMetaInfo, HasOnePersistence> {
  hasOne: string;
}

const defaultMetaInfo = {
  verb: 'HasOne',
  persistence: {
    single: true,
    stored: false,
    embedded: false,
  },
};
const defaultInternal = {};
const defaultInput = {};

export class HasOne extends RelationBase<
  HasOneMetaInfo,
  HasOneInput,
  HasOneInternal,
  HasOnePersistence
> {
  get hasOne(): IEntityRef {
    return this.$obj.hasOne;
  }

  get ref(): IEntityRef {
    return this.$obj.hasOne;
  }

  constructor(inp: HasOneInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: HasOneInput) {
    super.updateWith(input);

    assignValue<HasOneMetaInfo, HasOneInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => set(src, 'persistence.embedded', value),
    });

    assignValue<HasOneInternal, HasOneInput, string>({
      src: this.$obj,
      input,
      field: 'hasOne',
      effect: (src, value) => {
        src.hasOne = new EntityReference(value);
        if (!src.hasOne.backField) {
          src.hasOne.backField = 'id';
        }
      },
    });
  }

  // it get fixed object
  public toObject(): HasOneInput {
    return merge({}, super.toObject(), {
      hasOne: this.hasOne.toString(),
    });
  }
}
