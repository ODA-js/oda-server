import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { merge } from 'lodash';
import {
  IFieldArgs,
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
import { Internal, MetaData } from './element';
import { IEntityRef, EntityReference } from './entityreference';
import { IArgs, Args } from './args';

export interface IFieldBase<
  M extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<M, P>,
  P extends FieldBasePersistence,
  O extends FieldBaseOutput<M, P>
> extends IModelBase<M, I, O> {
  readonly idKey: IEntityRef;
  readonly type: FieldType;
  readonly inheritedFrom?: string;
  readonly order: number;
  readonly derived: boolean;
  readonly args: Map<string, IArgs>;
  readonly persistent: boolean;
  readonly identity: boolean | string | string[];
  readonly required: boolean;
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
  extends ModelBaseMetaInfo {
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
  args: Map<string, IArgs>;
  inheritedFrom?: string;
  type: FieldType;
  idKey: IEntityRef;
}

export interface FieldBaseInput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseInput<T> {
  args?: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
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
  args: NamedArray<IFieldArgs>;
}

export const fieldBaseDefaultMetaInfo = {
  persistence: {
    derived: false,
    persistent: true,
    identity: false,
    required: false,
    indexed: false,
  },
  acl: {
    read: [],
    update: [],
    // create: [],
    // delete: [],
  },
};
export const fieldBaseDefaultInput = { metadata: fieldBaseDefaultMetaInfo };

export class FieldBase<
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

  get type(): FieldType {
    return this[Internal].type;
  }

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): Map<string, IArgs> {
    return this[Internal].args;
  }

  get order(): number {
    return this.metadata.order;
  }

  get derived(): boolean {
    return this[MetaData].persistence.derived;
  }

  get persistent(): boolean {
    return this[MetaData].persistence.persistent;
  }

  get identity(): boolean | string | string[] {
    return this[MetaData].persistence.identity;
  }

  get required(): boolean {
    return this[MetaData].persistence.required;
  }

  get indexed(): boolean | string | string[] {
    return this[MetaData].persistence.indexed;
  }

  constructor(init: I) {
    super(merge({}, fieldBaseDefaultInput, init));
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<S, I, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value.trim())),
      required: true,
    });

    assignValue({
      src: this[Internal],
      input,
      field: 'inheritedFrom',
    });

    assignValue<S, I, AsHash<IFieldArgs> | NamedArray<IFieldArgs>>({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value, v => new Args(v))
          : HashToMap(value, (name, v) => new Args({ name, ...v }))),
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
      effect: (src, value) => (src.persistence.derived = value),
    });

    assignValue({
      src: this.metadata,
      input,
      inputField: 'persistent',
      effect: (src, value) => (src.persistence.persistent = value),
    });

    assignValue<T, I, boolean | string | string[]>({
      src: this.metadata,
      input,
      inputField: 'identity',
      effect: (_, value) => {
        if (typeof value === 'string') {
          value = value.trim();
        }
        if (Array.isArray(value)) {
          value = value.map(v => v.trim());
        }
        this.metadata.persistence.identity = value;
        if (value) {
          this.metadata.persistence.required = true;
          this.metadata.persistence.indexed =
            this.metadata.persistence.indexed || true;
          this[Internal].idKey = new EntityReference({
            entity: this.metadata.entity,
            field: this[Internal].name,
          });
        }
      },
    });

    assignValue<T, I, boolean | string | string[]>({
      src: this.metadata,
      input,
      inputField: 'indexed',
      effect: (src, value) => {
        if (typeof value === 'string') {
          value = value.trim();
        }
        if (Array.isArray(value)) {
          value = value.map(v => v.trim());
        }
        src.persistence.indexed = value;
      },
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
      args: this[Internal].args
        ? MapToHash(this[Internal].args, (_name, v) => v.toObject())
        : undefined,
      required: this.required,
      indexed: this.indexed,
      identity: this.identity,
    } as Partial<O>);
  }
}
