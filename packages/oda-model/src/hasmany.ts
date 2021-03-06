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
  readonly hasMany: IEntityRef;
}

export interface HasManyMetaInfo
  extends RelationBaseMetaInfo<HasManyPersistence> {}

export interface HasManyInternal extends RelationBaseInternal {
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

export const hasManyDefaultMetaInfo = {
  verb: 'HasMany',
  persistence: {
    single: false,
    stored: false,
    embedded: false,
  },
};
export const hasManyDefaultInput = { metadata: hasManyDefaultMetaInfo };

export class HasMany extends RelationBase<
  HasManyMetaInfo,
  HasManyInput,
  HasManyInternal,
  HasManyPersistence,
  HasManyOutput
> {
  get hasMany(): IEntityRef {
    return this[Internal].hasMany;
  }

  get ref(): IEntityRef {
    return this[Internal].hasMany;
  }

  constructor(init: HasManyInput) {
    super(merge({}, hasManyDefaultInput, init));
  }

  public updateWith(input: Nullable<HasManyInput>) {
    super.updateWith(input);

    assignValue<HasManyInternal, HasManyInput, HasManyInput['hasMany']>({
      src: this[Internal],
      input,
      field: 'hasMany',
      effect: (src, value) => {
        src.hasMany = new EntityReference(value);
        if (!src.hasMany.backField) {
          src.hasMany.updateWith({ backField: 'id' } as Nullable<
            EntityRefInput
          >);
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

  public mergeWith(payload: Nullable<HasManyInput>) {
    super.mergeWith(payload);
  }
}
