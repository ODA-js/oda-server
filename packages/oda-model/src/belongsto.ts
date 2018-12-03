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

export interface BelongsToPersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface IBelongsToRelation
  extends IRelation<BelongsToMetaInfo, BelongsToInput, BelongsToPersistence> {
  belongsTo: IEntityRef;
}

export interface BelongsToMetaInfo
  extends RelationBaseMetaInfo<BelongsToPersistence> {}

export interface BelongsToInternal
  extends RelationBaseInternal<BelongsToMetaInfo, BelongsToPersistence> {
  belongsTo: IEntityRef;
}

export interface BelongsToInput
  extends RelationBaseInput<BelongsToMetaInfo, BelongsToPersistence> {
  belongsTo: string;
}

const defaultMetaInfo = {
  verb: 'BelongsTo',
  persistence: {
    single: true,
    stored: true,
    embedded: false,
  },
};
const defaultInternal = {};
const defaultInput = {};

export class BelongsTo extends RelationBase<
  BelongsToMetaInfo,
  BelongsToInput,
  BelongsToInternal,
  BelongsToPersistence
> {
  get belongsTo(): IEntityRef {
    return this.$obj.belongsTo;
  }

  get ref(): IEntityRef {
    return this.$obj.belongsTo;
  }

  constructor(inp: BelongsToInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: BelongsToInput) {
    super.updateWith(input);

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => set(src, 'persistence.embedded', value),
    });

    assignValue<BelongsToInternal, BelongsToInput, string>({
      src: this.$obj,
      input,
      field: 'belongsTo',
      effect: (src, value) => (src.belongsTo = new EntityReference(value)),
    });
  }

  // it get fixed object
  public toObject(): BelongsToInput {
    return merge({}, super.toObject(), {
      belongsTo: this.belongsTo.toString(),
    });
  }
}
