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
import { Internal } from './element';

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

export interface HasOneInternal extends RelationBaseInternal {
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

export const hasOneDefaultMetaInfo = {
  verb: 'HasOne',
  persistence: {
    single: true,
    stored: false,
    embedded: false,
  },
};
export const hasOneDefaultInput = { metadata: hasOneDefaultMetaInfo };

export class HasOne extends RelationBase<
  HasOneMetaInfo,
  HasOneInput,
  HasOneInternal,
  HasOnePersistence,
  HasOneOutput
> {
  get hasOne(): IEntityRef {
    return this[Internal].hasOne;
  }

  get ref(): IEntityRef {
    return this[Internal].hasOne;
  }

  constructor(init: HasOneInput) {
    super(merge({}, hasOneDefaultInput, init));
  }

  public updateWith(input: Nullable<HasOneInput>) {
    super.updateWith(input);

    assignValue<HasOneInternal, HasOneInput, string>({
      src: this[Internal],
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
