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
  MetaModelType,
  MapToHash,
  Nullable,
  assignValue,
  IndexValueType,
  CommonArgs,
  CommonArgsInput,
  CommonArgsOutput,
  makeIndexDefinition,
  convertIndexValueTypeToIndexDefinition,
  IndexFieldStore,
  IndexDefinition,
  IndexTypes,
} from './types';
import { inputArgs } from './utils/converters';
import { Internal, MetaData } from './element';
import { IEntityRef, EntityReference } from './entityreference';

export interface IFieldBase<
  M extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<M, P>,
  P extends FieldBasePersistence,
  O extends FieldBaseOutput<M, P>
> extends IModelBase<M, I, O> {
  readonly idKey?: IEntityRef;
  readonly type: FieldType;
  readonly inheritedFrom?: string;
  readonly order: number;
  readonly derived: boolean;
  readonly args: CommonArgs;
  readonly persistent: boolean;
  readonly identity: boolean;
  readonly required: boolean;
  readonly indexed: boolean;
  readonly indexes: IndexFieldStore;
  fixIndexes: () => void;
  addIndex: (
    index: IndexDefinition[] | IndexDefinition,
    type?: IndexTypes,
    sparse?: boolean,
  ) => void;
}

export interface FieldBasePersistence {
  /** is field derived in code */
  derived: boolean;
  /** is field persisted somewhere */
  persistent: boolean;
  /** is field required */
  required: boolean;
  /** is field identity */
  identity: boolean;
  /** is field indexed */
  indexed: boolean;
  /** index definition */
  indexes: IndexFieldStore;
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
  args: CommonArgs;
  inheritedFrom?: string;
  type: FieldType;
  idKey?: IEntityRef;
}

export interface FieldBaseInput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseInput<T> {
  args?: CommonArgsInput;
  inheritedFrom?: string;
  derived?: boolean;
  persistent?: boolean;
  entity?: string;
  type?: FieldType;
  order?: number;
  required?: boolean;
  identity?: IndexValueType;
  indexed?: IndexValueType;
}

export interface FieldBaseOutput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseOutput<T> {
  inheritedFrom?: string;
  type?: FieldType;
  args: CommonArgsOutput;
}

export const fieldBaseDefaultMetaInfo = {
  persistence: {
    derived: false,
    persistent: true,
    identity: false,
    required: false,
    indexed: false,
    indexes: {},
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
  public get idKey(): IEntityRef | undefined {
    return this[Internal].idKey;
  }

  get type(): FieldType {
    return this[Internal].type;
  }

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): CommonArgs {
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

  get identity(): boolean {
    return this[MetaData].persistence.identity;
  }

  get required(): boolean {
    return this[MetaData].persistence.required;
  }

  get indexed(): boolean {
    return this[MetaData].persistence.indexed;
  }

  get indexes(): IndexFieldStore {
    return this[MetaData].persistence.indexes;
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
      effect: (src, value) => (src.args = inputArgs(value)),
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
        this.metadata.persistence.identity = !!value;
        if (value) {
          const index = convertIndexValueTypeToIndexDefinition(
            this.name,
            value,
          );
          if (index) {
            index.forEach(i => {
              this.addIndex(i, 'unique', i.sparse);
            });
          }
        }

        if (value) {
          this.metadata.persistence.required = true;
          this.metadata.persistence.indexed =
            this.metadata.persistence.indexed || true;
          this[Internal].idKey = new EntityReference({
            entity: this.metadata.entity,
            field: this[Internal].name,
          });
        } else {
          delete this.metadata.persistence.required;
          delete this.metadata.persistence.indexed;
          delete this[Internal].idKey;
        }
      },
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['indexed']>>({
      src: this.metadata,
      input,
      inputField: 'indexed',
      effect: (src, value) => {
        if (value) {
          const index = convertIndexValueTypeToIndexDefinition(
            this.name,
            value,
          );
          if (index) {
            index.forEach(i => {
              this.addIndex(i, i.type, i.sparse);
            });
          }
        }
        src.persistence.indexed = !!value;
      },
    });

    assignValue<T, I, NonNullable<FieldBaseInput<T, P>['required']>>({
      src: this.metadata,
      input,
      inputField: 'required',
      effect: (src, value) => (src.persistence.required = value),
    });

    this.fixIndexes();
  }

  public fixIndexes() {
    Object.keys(this.indexes).forEach(index => {
      this.metadata.persistence.identity =
        this.metadata.persistence.identity ||
        this.indexes[index].type === 'unique';
      this.metadata.persistence.indexed = true;
      this.metadata.persistence.required =
        this.metadata.persistence.required ||
        this.metadata.persistence.identity;
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
    this.addIndex(makeIndexDefinition(this.name), 'unique', true);
  }

  public addIndex(
    index: IndexDefinition[] | IndexDefinition,
    type?: IndexTypes,
    sparse?: boolean,
  ) {
    if (Array.isArray(index)) {
      index.forEach(i => this.addIndex(i, type, sparse));
    } else {
      this.indexes[index.name] = { ...index, type, sparse };
    }

    this.fixIndexes();
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
