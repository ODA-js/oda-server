import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { merge, get } from 'lodash';
import {
  FieldArgs,
  FieldType,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
  Nullable,
  assignValue,
  NamedArray,
  ArrayToMap,
} from './types';
import { ElementMetaInfo, Internal } from './element';
import { IEntityRef, EntityReference } from './entityreference';

export interface IFieldBase<
  M extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<M, P>,
  P extends FieldBasePersistence,
  O extends FieldBaseOutput<M, P>
> extends IModelBase<M, I, O> {
  readonly idKey: IEntityRef;
  readonly type?: FieldType;
  readonly inheritedFrom?: string;
  readonly order: number;
  readonly derived: boolean;
  readonly args: Map<string, FieldArgs>;
  readonly persistent?: boolean;
  readonly identity: boolean | string | string[];
  readonly required?: boolean;
  readonly indexed: boolean | string | string[];
}

export interface FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
  required: boolean;
  identity: boolean | string | string[];
  indexed: boolean | string | string[];
}

export interface FieldBaseMetaInfo<T extends FieldBasePersistence>
  extends ElementMetaInfo {
  entity: string;
  persistence: T;
  order: number;
  acl: {
    /** if package allowed to read property */
    read: string[];
    /** if package allowed to update property */
    update: string[];
    /** not applicable */
    // create: string[];
    // delete: string[];
  };
}

export interface FieldBaseInternal extends ModelBaseInternal {
  args: Map<string, FieldArgs>;
  inheritedFrom?: string;
  type?: FieldType;
  idKey: IEntityRef;
}

export interface FieldBaseInput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseInput<T> {
  args?: AsHash<FieldArgs> | NamedArray<FieldArgs>;
  inheritedFrom?: string;
  derived?: boolean;
  persistent?: boolean;
  entity?: string;
  type?: FieldType;
  order?: number;
  required?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
}

export interface FieldBaseOutput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseOutput<T> {
  inheritedFrom?: string;
  derived?: boolean;
  persistent?: boolean;
  entity?: string;
  type?: FieldType;
  order?: number;
  required?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
  args: NamedArray<FieldArgs>;
}

const defaultMetaInfo = {
  persistence: {},
  acl: {
    read: [],
    update: [],
    // create: [],
    // delete: [],
  },
};
const defaultInput = { metadata: defaultMetaInfo };

export abstract class FieldBase<
  T extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<T, P>,
  S extends FieldBaseInternal,
  P extends FieldBasePersistence,
  O extends FieldBaseOutput<T, P>
> extends ModelBase<T, I, S, O> implements IFieldBase<T, I, P, O> {
  public get modelType(): MetaModelType {
    return 'field-base';
  }
  public get idKey(): IEntityRef {
    return this[Internal].idKey;
  }

  get type(): FieldType | undefined {
    return this[Internal].type;
  }

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): Map<string, FieldArgs> {
    return this[Internal].args;
  }

  get order(): number {
    return this.metadata.order;
  }

  get derived(): boolean {
    return get(this.metadata, 'persistence.derived', false);
  }

  get persistent(): boolean {
    return get(this.metadata, 'persistence.persistent', false);
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

  constructor(init: I) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<S, I, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = decapitalize(value);
      },
      required: true,
    });

    assignValue({
      src: this[Internal],
      input,
      field: 'inheritedFrom',
    });

    assignValue<S, I, AsHash<FieldArgs> | NamedArray<FieldArgs>>({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      setDefault: src => (src.args = new Map()),
    });

    assignValue({
      src: this.metadata,
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue({
      src: this.metadata,
      input,
      inputField: 'derived',
      effect: (src, value) => (src.persistence.derived, value),
    });

    assignValue({
      src: this.metadata,
      input,
      inputField: 'persistent',
      effect: (src, value) => (src.persistence.persistent = value),
    });

    assignValue<T, I, boolean>({
      src: this.metadata,
      input,
      inputField: 'identity',
      effect: (_, value) => {
        this.metadata.persistence.identity = value;
        if (value) {
          this.metadata.persistence.required = true;
          this.metadata.persistence.indexed = true;
          this[Internal].idKey = new EntityReference({
            entity: this.metadata.entity,
            field: this[Internal].name,
          });
        }
      },
    });

    assignValue<T, I, boolean>({
      src: this.metadata,
      input,
      inputField: 'indexed',
      effect: (src, value) => (src.persistence.indexed = value),
    });

    assignValue<T, I, boolean>({
      src: this.metadata,
      input,
      inputField: 'required',
      effect: (src, value) => (src.persistence.required = value),
    });
  }

  public makeIdentity() {
    this[Internal].idKey = new EntityReference({
      entity: this.metadata.entity,
      field: this[Internal].name,
      backField: 'id',
    });
    this.metadata.persistence.indexed = true;
    this.metadata.persistence.identity = true;
    this.metadata.persistence.required = true;
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      entity: this.metadata.entity,
      derived: this.derived,
      persistent: this.persistent,
      inheritedFrom: this[Internal].inheritedFrom,
      order: this.metadata.order,
      args: this[Internal].args ? MapToHash(this[Internal].args) : undefined,
      required: this.required,
      indexed: this.indexed,
      identity: this.identity,
    } as Partial<O>);
  }
}
