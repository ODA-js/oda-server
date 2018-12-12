import {
  IRelationBase,
  RelationBasePersistence,
  RelationBaseMetaInfo,
  RelationBaseInput,
  RelationBaseInternal,
  RelationBase,
  RelationBaseOutput,
} from './relationbase';
import { IEntityRef, EntityReference, EntityRefInput } from './entityreference';
import { merge } from 'lodash';
import { assignValue, Nullable } from './types';

export interface HasOnePersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface IHasOneRelation
  extends IRelationBase<
    HasOneMetaInfo,
    HasOneInput,
    HasOnePersistence,
    HasOneOutput
  > {
  readonly hasOne: IEntityRef;
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

export interface HasOneOutput
  extends RelationBaseOutput<HasOneMetaInfo, HasOnePersistence> {
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
const defaultInput = { metadata: defaultMetaInfo };

export class HasOne extends RelationBase<
  HasOneMetaInfo,
  HasOneInput,
  HasOneInternal,
  HasOnePersistence,
  HasOneOutput
> {
  get hasOne(): IEntityRef {
    return this.$obj.hasOne;
  }

  get ref(): IEntityRef {
    return this.$obj.hasOne;
  }

  constructor(init: HasOneInput) {
    super(merge({}, defaultInput, init));
    this.initNames();
  }

  public updateWith(input: Nullable<HasOneInput>) {
    super.updateWith(input);

    assignValue<HasOneMetaInfo, HasOneInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => (src.persistence.embedded = value),
    });

    assignValue<HasOneInternal, HasOneInput, string>({
      src: this.$obj,
      input,
      field: 'hasOne',
      effect: (src, value) => {
        src.hasOne = new EntityReference(value);
        if (!src.hasOne.backField) {
          src.hasOne.updateWith({ backField: 'id' } as Nullable<
            EntityRefInput
          >);
        }
      },
    });
  }

  // it get fixed object
  public toObject(): HasOneOutput {
    return merge({}, super.toObject(), {
      hasOne: this.hasOne.toString(),
    } as Partial<HasOneOutput>);
  }
}
