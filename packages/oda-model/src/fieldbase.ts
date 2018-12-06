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
import { ElementMetaInfo } from './element';
import { IEntityRef, EntityReference } from './entityreference';

export interface IFieldBase<
  M extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<M, P>,
  P extends FieldBasePersistence,
  O extends FieldBaseOutput<M, P>
> extends IModelBase<M, I, O> {
  args: Map<string, FieldArgs>;
  inheritedFrom?: string;
  type?: FieldType;
  required?: boolean;
  indexed: boolean | string | string[];
  identity: boolean | string | string[];
  idKey: IEntityRef;
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
}

export interface FieldBaseInternal<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseInternal<T> {
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

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export abstract class FieldBase<
  T extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<T, P>,
  S extends FieldBaseInternal<T, P>,
  P extends FieldBasePersistence,
  O extends FieldBaseOutput<T, P>
> extends ModelBase<T, I, S, O> implements IFieldBase<T, I, P, O> {
  public modelType: MetaModelType = 'field-base';
  public get idKey(): IEntityRef {
    return this.$obj.idKey;
  }

  get type(): FieldType | undefined {
    return this.$obj.type;
  }

  get inheritedFrom(): string | undefined {
    return this.$obj.inheritedFrom;
  }

  get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  get order(): number {
    return this.metadata_.order;
  }

  get derived(): boolean {
    return get(this.metadata_, 'persistence.derived', false);
  }

  get persistent(): boolean {
    return get(this.metadata_, 'persistence.persistent', false);
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

  constructor(inp: I) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<S, I, string>({
      src: this.$obj,
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = decapitalize(value);
      },
      required: true,
    });

    assignValue({
      src: this.$obj,
      input,
      field: 'inheritedFrom',
    });

    assignValue<S, I, AsHash<FieldArgs> | NamedArray<FieldArgs>>({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      setDefault: src => (src.args = new Map()),
    });

    assignValue({
      src: this.metadata_,
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue({
      src: this.metadata_,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue({
      src: this.metadata_,
      input,
      inputField: 'derived',
      effect: (src, value) => (src.persistence.derived, value),
    });

    assignValue({
      src: this.metadata_,
      input,
      inputField: 'persistent',
      effect: (src, value) => (src.persistence.persistent = value),
    });

    assignValue<T, I, boolean>({
      src: this.metadata_,
      input,
      inputField: 'identity',
      effect: (_, value) => {
        this.metadata_.persistence.identity = value;
        if (value) {
          this.metadata_.persistence.required = true;
          this.metadata_.persistence.indexed = true;
          this.$obj.idKey = new EntityReference({
            entity: this.metadata_.entity,
            field: this.$obj.name,
          });
        }
      },
    });

    assignValue<T, I, boolean>({
      src: this.metadata_,
      input,
      inputField: 'indexed',
      effect: (src, value) => (src.persistence.indexed = value),
    });

    assignValue<T, I, boolean>({
      src: this.metadata_,
      input,
      inputField: 'required',
      effect: (src, value) => (src.persistence.required = value),
    });
  }

  public makeIdentity() {
    this.$obj.idKey = new EntityReference({
      entity: this.$obj.metadata.entity,
      field: this.$obj.name,
      backField: 'id',
    });
    this.metadata_.persistence.indexed = true;
    this.metadata_.persistence.identity = true;
    this.metadata_.persistence.required = true;
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      entity: this.metadata_.entity,
      derived: this.derived,
      persistent: this.persistent,
      inheritedFrom: this.$obj.inheritedFrom,
      order: this.metadata_.order,
      args: this.$obj.args ? MapToHash(this.$obj.args) : undefined,
      required: this.required,
      indexed: this.indexed,
      identity: this.identity,
    } as Partial<O>);
  }
}
