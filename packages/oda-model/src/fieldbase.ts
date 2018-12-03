import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { merge, get, set } from 'lodash';
import {
  FieldArgs,
  FieldType,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
  Nullable,
  assignValue,
} from './model';
import { ElementMetaInfo } from './element';

export interface IFieldBase<
  M extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<M, P>,
  P extends FieldBasePersistence
> extends IModelBase<M, I> {
  /**
   * set of arguments
   */
  args?: Map<string, FieldArgs>;
  /**
   * is it field inherited from other entity and which one
   */
  inheritedFrom?: string;
  type?: FieldType;
}

export interface FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
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
  args?: Map<string, FieldArgs>;
  inheritedFrom?: string;
  type?: FieldType;
}

export interface FieldBaseInput<
  T extends FieldBaseMetaInfo<P>,
  P extends FieldBasePersistence
> extends ModelBaseInput<T> {
  args?: AsHash<FieldArgs>;
  inheritedFrom?: string;
  derived?: boolean;
  persistent?: boolean;
  entity?: string;
  arguments?: AsHash<FieldArgs>;
  type?: FieldType;
  order?: number;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export abstract class FieldBase<
  T extends FieldBaseMetaInfo<P>,
  I extends FieldBaseInput<T, P>,
  S extends FieldBaseInternal<T, P>,
  P extends FieldBasePersistence
> extends ModelBase<T, I, S> implements IFieldBase<T, I, P> {
  public modelType: MetaModelType = 'field-base';

  get type(): FieldType | undefined {
    return this.$obj.type;
  }

  get inheritedFrom(): string | undefined {
    return this.$obj.inheritedFrom;
  }

  get args(): Map<string, FieldArgs> | undefined {
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

    assignValue<S, I, AsHash<FieldArgs>>({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) => (src.args = HashToMap(value)),
    });

    assignValue<T, I, AsHash<FieldArgs>>({
      src: this.metadata_,
      input,
      field: 'entity',
      effect: (src, value) => set(src, 'entity', value),
    });

    assignValue<T, I, AsHash<FieldArgs>>({
      src: this.metadata_,
      input,
      field: 'order',
      effect: (src, value) => set(src, 'order', value),
    });

    assignValue<T, I, AsHash<FieldArgs>>({
      src: this.metadata_,
      input,
      inputField: 'derived',
      effect: (src, value) => set(src, 'persistence.derived', value),
    });

    assignValue<T, I, AsHash<FieldArgs>>({
      src: this.metadata_,
      input,
      inputField: 'persistent',
      effect: (src, value) => set(src, 'persistence.persistent', value),
    });
  }

  public toObject(): I {
    return merge({}, super.toObject(), {
      entity: this.metadata_.entity,
      derived: this.derived,
      persistent: this.persistent,
      inheritedFrom: this.$obj.inheritedFrom,
      order: this.metadata_.order,
      args: this.$obj.args ? MapToHash(this.$obj.args) : undefined,
    });
  }
}
