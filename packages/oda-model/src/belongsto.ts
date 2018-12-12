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
import { merge, get } from 'lodash';
import { assignValue, Nullable } from './types';

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
  required?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
}

export interface BelongsToOutput
  extends RelationBaseOutput<BelongsToMetaInfo, BelongsToPersistence> {
  belongsTo: string;
  required?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
}

const defaultMetaInfo = {
  verb: 'BelongsTo',
  persistence: {
    single: true,
    stored: true,
    embedded: false,
    indexed: true,
    identity: false,
    required: false,
  },
};
const defaultInput = { metadata: defaultMetaInfo };

export class BelongsTo extends RelationBase<
  BelongsToMetaInfo,
  BelongsToInput,
  BelongsToInternal,
  BelongsToPersistence,
  BelongsToOutput
> {
  get belongsTo(): IEntityRef {
    return this.$obj.belongsTo;
  }

  get ref(): IEntityRef {
    return this.$obj.belongsTo;
  }

  get identity(): boolean | string | string[] {
    return get(this.metadata_, 'persistence.identity', false);
  }

  get required(): boolean {
    return get(this.metadata_, 'persistence.required', false);
  }

  get indexed(): boolean | string | string[] {
    return get(this.metadata_, 'persistence.indexed', false);
  }

  constructor(init: BelongsToInput) {
    super(merge({}, defaultInput, init));
    this.initNames();
  }

  public updateWith(input: Nullable<BelongsToInput>) {
    super.updateWith(input);

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => (src.persistence.embedded = value),
      setDefault: src => (src.persistence.embedded = false),
    });

    assignValue<BelongsToInternal, BelongsToInput, string>({
      src: this.$obj,
      input,
      field: 'belongsTo',
      effect: (src, value) => (src.belongsTo = new EntityReference(value)),
      required: true,
    });

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'indexed',
      effect: (src, value) => (src.persistence.indexed = value),
      setDefault: src => (src.persistence.indexed = false),
    });

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'identity',
      effect: (src, value) => (src.persistence.identity = value),
      setDefault: src => (src.persistence.identity = false),
    });

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'required',
      effect: (src, value) => (src.persistence.required = value),
      setDefault: src => (src.persistence.required = false),
    });
  }

  // it get fixed object
  public toObject(): BelongsToOutput {
    return merge({}, super.toObject(), {
      belongsTo: this.belongsTo.toString(),
    } as Partial<BelongsToOutput>);
  }
}
