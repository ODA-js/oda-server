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
    return this[Internal].belongsTo;
  }

  get ref(): IEntityRef {
    return this[Internal].belongsTo;
  }

  get identity(): boolean | string | string[] {
    return get(this.metadata, 'persistence.identity', false);
  }

  get required(): boolean {
    return get(this.metadata, 'persistence.required', false);
  }

  get indexed(): boolean | string | string[] {
    return get(this.metadata, 'persistence.indexed', false);
  }

  constructor(init: BelongsToInput) {
    super(merge({}, defaultInput, init));
    this.initNames();
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

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata,
      input,
      inputField: 'indexed',
      effect: (src, value) => (src.persistence.indexed = value),
      setDefault: src => (src.persistence.indexed = false),
    });

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata,
      input,
      inputField: 'identity',
      effect: (src, value) => (src.persistence.identity = value),
      setDefault: src => (src.persistence.identity = false),
    });

    assignValue<BelongsToMetaInfo, BelongsToInput, boolean>({
      src: this.metadata,
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
