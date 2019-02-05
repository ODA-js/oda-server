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
  FieldType,
  AsHash,
  MetaModelType,
  MapToHash,
  Nullable,
  assignValue,
  NamedArray,
} from './types';
import { applyArgs } from './applyArgs';
import { Internal, MetaData } from './element';
import { IEntityRef, EntityReference } from './entityreference';
import {
  IRecordField,
  RecordFieldInput,
  RecordFieldOutput,
} from './recordfield';
import { IRecord, RecordInput, RecordOutput } from './record';

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
  readonly args: Map<string, IRecordField | IRecord>;
  readonly persistent: boolean;
  readonly identity: boolean | string | string[];
  readonly required: boolean;
  readonly indexed: boolean | string | string[];
}

export interface FieldBasePersistence {
  /** is field derived in code */
  derived: boolean;
  /** is field persisted somewhere */
  persistent: boolean;
  /** is field required */
  required: boolean;
  /** is field identity */
  identity: boolean | string | string[];
  /** is field indexed */
  indexed: boolean | string | string[];
}

export interface FieldBaseMetaInfoACL {
  /** if package allowed to read property */
  read: string[];
  /** if package allowed to update property */
  update: string[];
  /** not applicable */
  // addTo: string[];
  // removeFrom: string[];
}

export interface FieldBaseMetaInfo<T extends FieldBasePersistence>
  extends ModelBaseMetaInfo {
  entity: string;
  persistence: T;
  order: number;
  acl: FieldBaseMetaInfoACL;
}

export interface FieldBaseInternal extends ModelBaseInternal {
  args: Map<string, IRecordField | IRecord>;
  inheritedFrom?: string;
  type: FieldType;
  idKey: IEntityRef;
}

export interface FieldBaseInput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseInput<T> {
  args?:
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
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
  type?: FieldType;
  args: NamedArray<RecordOutput | RecordFieldOutput>;
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

  get args(): Map<string, IRecordField | IRecord> {
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

    assignValue<S, I, FieldBaseInput<T, P>['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value.trim())),
      required: true,
    });

    assignValue<S, I, FieldBaseInput<T, P>['inheritedFrom']>({
      src: this[Internal],
      input,
      field: 'inheritedFrom',
    });

    assignValue<S, I, NonNullable<FieldBaseInput<T, P>['args']>>({
      src: this[Internal],
      input,
      field: 'args',
      effect: applyArgs,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['entity']>>({
      src: this.metadata,
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['order']>>({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['derived']>>({
      src: this.metadata,
      input,
      inputField: 'derived',
      effect: (src, value) => (src.persistence.derived = value),
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['persistent']>>({
      src: this.metadata,
      input,
      inputField: 'persistent',
      effect: (src, value) => (src.persistence.persistent = value),
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['identity']>>({
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

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['indexed']>>({
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

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['required']>>({
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
      inheritedFrom: this[Internal].inheritedFrom,
      args: this[Internal].args
        ? MapToHash(this[Internal].args, (_name, v) => v.toObject())
        : undefined,
    } as Partial<O>);
  }
  public mergeWith(payload: Nullable<I>) {
    super.mergeWith(payload);
  }
}
