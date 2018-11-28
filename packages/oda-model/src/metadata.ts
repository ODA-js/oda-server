import { IValidate, IValidator, IValidationResultInput } from './validation';
import { merge } from 'lodash';

export interface BaseMeta {}

export interface MetadataStorage<T extends BaseMeta> {
  metadata: T;
}

export interface MetadataInput<T extends BaseMeta> {
  metadata: T;
}

/**
 * updatable items
 */
export interface IUpdatable<T extends BaseMeta, K extends MetadataInput<T>> {
  /**
   * update item with data
   * @param payload the update payload
   */
  updateWith(payload: Partial<K>): void;
  /**
   * return copy of object item that is suitable for creating new one
   */
  toObject(): K;
}

/**
 * Meta interface for updating items with metadata
 */
export interface IMeta<T extends BaseMeta, K extends MetadataInput<T>>
  extends IUpdatable<T, K>,
    IValidate {
  /**
   * meta information that is outside of model notations and can be customized as well
   */
  readonly metadata: T;
}
export abstract class Metadata<
  T extends BaseMeta,
  K extends MetadataInput<T>,
  S extends MetadataStorage<T>
> implements IMeta<T, K> {
  protected $obj: S;
  protected metadata_: T;
  /**
   * metadata is not immutable
   */
  public get metadata(): T {
    return this.metadata_;
  }

  public validate(validator: IValidator): IValidationResultInput[] {
    return validator.check(this);
  }

  constructor(inp: MetadataInput<T>) {
    this.metadata_ = {} as T;
    this.$obj = {} as S;
    this.updateWith(inp);
  }
  /**
   * patches metadata for entity
   * @param obj metadata patch object
   */
  public updateWith(obj: Partial<MetadataInput<T>>) {
    if (obj.metadata) {
      this.metadata_ = merge({}, this.metadata_, obj.metadata);
    }
  }
  /**
   * make item usable within another constructor
   * it is suitable for cloning items
   */
  public toObject(): K {
    return merge(
      {},
      {
        metadata: this.metadata_,
      },
    ) as K;
  }
}
