import { IValidate, IValidator, IValidationResultInput } from './validation';
import { merge } from 'lodash';
import { MetaModelType, Nullable, assignValue } from './model';

export interface ElementMetaInfo {}

export interface ElementInternal<T extends ElementMetaInfo> {
  metadata: T;
}

export interface ElementInput<T extends ElementMetaInfo> {
  metadata?: T;
}

/**
 * updatable items
 */
export interface IUpdatable<
  T extends ElementMetaInfo,
  K extends ElementInput<T>
> {
  /**
   * update item with data
   * @param payload the update payload
   */
  updateWith(payload: Nullable<K>): void;
  /**
   * return copy of object item that is suitable for creating new one
   */
  toObject(): K;
}

/**
 * Meta interface for updating items with metadata
 */
export interface IMeta<T extends ElementMetaInfo, K extends ElementInput<T>>
  extends IUpdatable<T, K>,
    IValidate {
  /**
   * the kind of current item
   */
  readonly modelType: MetaModelType;
  /**
   * meta information that is outside of model notations and can be customized as well
   */
  readonly metadata: Readonly<T>;
}

const defaultMetaInfo = {};
const defaultInternal = {
  metadata: {},
};
const defaultInput = { metadata: {} };

export abstract class Element<
  M extends ElementMetaInfo,
  I extends ElementInput<M>,
  S extends ElementInternal<M>
> implements IMeta<M, I> {
  readonly modelType: MetaModelType = 'element';
  protected $obj: S;
  protected metadata_: M;
  /**
   * metadata is not immutable
   */
  public get metadata(): M {
    return this.metadata_;
  }

  public validate(validator: IValidator): IValidationResultInput[] {
    return validator.check(this);
  }

  constructor(init: ElementInput<M>) {
    this.metadata_ = defaultMetaInfo as M;
    this.$obj = defaultInternal as S;
    this.updateWith(merge({}, defaultInput, init));
  }
  /**
   * patches metadata for entity
   * @param input metadata patch object
   */
  public updateWith(input: Nullable<ElementInput<M>>) {
    assignValue<Element<M, I, S>, ElementInput<M>, ElementInternal<M>>({
      src: this,
      input,
      field: 'metadata',
      required: true,
      effect: (_, value) => (this.metadata_ = merge({}, this.metadata_, value)),
      setDefault: _ => (this.metadata_ = merge({}, defaultMetaInfo) as M),
    });
  }
  /**
   * make item usable within another constructor
   * it is suitable for cloning items
   */
  public toObject(): I {
    return merge({}, { metadata: this.metadata_ }) as I;
  }
}
