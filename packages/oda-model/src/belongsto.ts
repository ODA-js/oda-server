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
import { Internal } from './element';

export interface BelongsToPersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
  required: boolean;
  identity: boolean | string | string[];
  indexed: boolean | string | string[];
}

export interface IBelongsToRelation
  extends IRelationBase<
    BelongsToMetaInfo,
    BelongsToInput,
    BelongsToPersistence,
    BelongsToOutput
  > {
  readonly belongsTo: IEntityRef;
}

export interface BelongsToMetaInfo
  extends RelationBaseMetaInfo<BelongsToPersistence> {}

export interface BelongsToInternal extends RelationBaseInternal {
  belongsTo: IEntityRef;
}

export interface BelongsToInput
  extends RelationBaseInput<BelongsToMetaInfo, BelongsToPersistence> {
  belongsTo: string;
}

export interface BelongsToOutput
  extends RelationBaseOutput<BelongsToMetaInfo, BelongsToPersistence> {
  belongsTo: string;
}

export const belongsToDefaultMetaInfo = {
  verb: 'BelongsTo',
  persistence: {
    single: true,
    stored: true,
    embedded: false,
  },
};
export const belongsToDefaultInput = { metadata: belongsToDefaultMetaInfo };

export class BelongsTo extends RelationBase<
  BelongsToMetaInfo,
  BelongsToInput,
  BelongsToInternal,
  BelongsToPersistence,
  BelongsToOutput
> {
  get belongsTo(): IEntityRef {
    return this[Internal].belongsTo;
  }

  get ref(): IEntityRef {
    return this[Internal].belongsTo;
  }

  constructor(init: BelongsToInput) {
    super(merge({}, belongsToDefaultInput, init));
  }

  public updateWith(input: Nullable<BelongsToInput>) {
    super.updateWith(input);

    assignValue<BelongsToInternal, BelongsToInput, string>({
      src: this[Internal],
      input,
      field: 'belongsTo',
      effect: (src, value) => (src.belongsTo = new EntityReference(value)),
      required: true,
    });
  }

  // it get fixed object
  public toObject(): BelongsToOutput {
    return merge({}, super.toObject(), {
      belongsTo: this.belongsTo.toString(),
    } as Partial<BelongsToOutput>);
  }
  public mergeWith(payload: Nullable<BelongsToInput>) {
    super.mergeWith(payload);
  }
}
