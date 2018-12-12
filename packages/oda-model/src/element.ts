import { IValidate, IValidator, IValidationResultInput } from './validation';
import { merge } from 'lodash';
import { MetaModelType, Nullable, assignValue } from './types';

export interface ElementMetaInfo {}

export interface ElementInternal<T extends ElementMetaInfo> {
  metadata: T;
}

export interface ElementInput<T extends ElementMetaInfo> {
  metadata?: T;
}

export interface ElementOutput<T extends ElementMetaInfo> {
  metadata: T;
}

export interface IUpdatableBase {
  /**
   * update item with data
   * @param payload the update payload
   */
  updateWith(payload: any): void;
  /**
   * return copy of object item that is suitable for creating new one
   */
  toObject(): any;
}

/**
 * updatable items
 */
export interface IUpdatable<
  T extends ElementMetaInfo,
  I extends ElementInput<T>,
  O extends ElementOutput<T>
> extends IUpdatableBase {
  /**
   * update item with data
   * @param payload the update payload
   */
  updateWith(payload: Nullable<I>): void;
  /**
   * return copy of object item that is suitable for creating new one
   */
  toObject(): O;
}

/**
 * Meta interface for updating items with metadata
 */
export interface IMeta<
  M extends ElementMetaInfo,
  I extends ElementInput<M>,
  O extends ElementOutput<M>
> extends IUpdatable<M, I, O>, IValidate {
  /**
   * the kind of current item
   */
  readonly modelType: MetaModelType;
  /**
   * meta information that is outside of model notations and can be customized as well
   */
  readonly metadata: Readonly<M>;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

export class Element<
  M extends ElementMetaInfo,
  I extends ElementInput<M>,
  S extends ElementInternal<M>,
  O extends ElementOutput<M>
> implements IMeta<M, I, O> {
  public get modelType(): MetaModelType {
    return 'element';
  }
  protected $obj: S;
  protected metadata_!: M;
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
    this.$obj = {} as S;
    this.updateWith(merge({}, defaultInput, init));
  }
  /**
   * patches metadata for entity
   * @param input metadata patch object
   */
  public updateWith(input: Nullable<ElementInput<M>>) {
    assignValue<Element<M, I, S, O>, ElementInput<M>, ElementInternal<M>>({
      src: this,
      input,
      field: 'metadata',
      effect: (_, value) => (this.metadata_ = merge({}, this.metadata_, value)),
      setDefault: _ => (this.metadata_ = merge({}, defaultMetaInfo) as M),
    });
  }
  /**
   * make item usable within another constructor
   * it is suitable for cloning items
   */
  public toObject(): O {
    return merge({}, { metadata: this.metadata_ } as O);
  }
}
