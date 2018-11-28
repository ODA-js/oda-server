import {
  ModelBase,
  IModelBase,
  ModelBaseStorage,
  ModelBaseInput,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { merge } from 'lodash';
import {
  FieldArgs,
  FieldType,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
} from './model';
import { BaseMeta } from './metadata';

export interface IFieldBase<
  T extends FieldBaseMeta,
  K extends FieldBaseInput<T>
> extends IModelBase<T, K> {
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

export interface FieldBaseMeta extends BaseMeta {
  entity: string;
  derived: boolean;
  persistent: boolean;
}

export interface FieldBaseStorage<T extends FieldBaseMeta>
  extends ModelBaseStorage<T> {
  args?: Map<string, FieldArgs>;
  inheritedFrom?: string;
  type?: FieldType;
}

export interface FieldBaseInput<T extends FieldBaseMeta>
  extends ModelBaseInput<T> {
  args?: AsHash<FieldArgs>;
  inheritedFrom?: string;
  derived?: boolean;
  persistent?: boolean;
  entity: string;
  arguments?: AsHash<FieldArgs>;
  type?: FieldType;
}

export abstract class FieldBase<
  T extends FieldBaseMeta,
  I extends FieldBaseInput<T>,
  S extends FieldBaseStorage<T>
> extends ModelBase<T, I, S> implements IFieldBase<T, I> {
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

  public updateWith(obj: Partial<I>) {
    super.updateWith(obj);
    if (obj.name) {
      this.$obj.name = decapitalize(obj.name);
    }
    if (obj.inheritedFrom) {
      this.$obj.inheritedFrom = obj.inheritedFrom;
    }
    if (obj.args) {
      this.$obj.args = HashToMap(obj.args as any);
    }
    this.metadata_ = merge({}, this.metadata_, {
      entity: obj.entity,
      derived: obj.derived,
      persistent: obj.persistent,
    });
  }

  public toObject(): I {
    return merge({}, super.toObject(), {
      entity: this.metadata_.entity,
      derived: this.metadata_.derived,
      persistent: this.metadata_.persistent,
      inheritedFrom: this.$obj.inheritedFrom,
      args: this.$obj.args ? MapToHash(this.$obj.args) : undefined,
    });
  }
}
