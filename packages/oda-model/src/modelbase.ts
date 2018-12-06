import * as inflected from 'inflected';
import {
  ElementMetaInfo,
  ElementInternal,
  ElementInput,
  Element,
  IMeta,
  ElementOutput,
} from './element';
import { MetaModelType, INamed } from './types';
import { merge } from 'lodash';
import { Nullable, assignValue } from './types';

export interface ModelMetaInfo extends ElementMetaInfo {}

export interface ModelBaseInternal<T extends ModelMetaInfo>
  extends ElementInternal<T> {
  name: string;
  title?: string;
  description?: string;
}

export interface ModelBaseInput<T extends ModelMetaInfo>
  extends ElementInput<T> {
  name: string;
  title?: string;
  description?: string;
}

export interface ModelBaseOutput<T extends ModelMetaInfo>
  extends ElementOutput<T> {
  name: string;
  title?: string;
  description?: string;
}

/**
 * the base model item
 */
export interface IModelBase<
  T extends ModelMetaInfo,
  I extends ModelBaseInput<T>,
  O extends ModelBaseOutput<T>
> extends IMeta<T, I, O>, INamed {
  /**
   * name of modeled item
   */
  readonly name: string;
  /**
   * possible title
   */
  readonly title?: string;
  /**
   * description
   */
  readonly description?: string;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export abstract class ModelBase<
  T extends ElementMetaInfo,
  I extends ModelBaseInput<T>,
  S extends ModelBaseInternal<T>,
  O extends ModelBaseOutput<T>
> extends Element<T, I, S, O> implements IModelBase<T, I, O> {
  readonly modelType: MetaModelType = 'metadata';
  constructor(inp: ModelBaseInput<T>) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }
  get name(): string {
    return this.$obj.name;
  }

  get title(): string | undefined {
    return this.$obj.title;
  }

  get description(): string | undefined {
    return this.$obj.description;
  }

  /**
   * update Modelbase
   * @param input update payload
   */
  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<S, I, string>({
      src: this.$obj,
      input,
      field: 'name',
      effect: (src, value) => (src.name = inflected.camelize(value, false)),
      required: true,
    });

    assignValue<S, I, string>({
      src: this.$obj,
      input,
      field: 'title',
      effect: (src, value) =>
        (src.title = inflected.camelize(value.trim(), false)),
      required: true,
    });

    assignValue<S, I, string>({
      src: this.$obj,
      input,
      field: 'description',
      effect: (src, value) =>
        (src.description = inflected.camelize(value.trim(), false)),
      required: true,
    });
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      name: this.name,
      title: this.title,
      description: this.description,
    } as Partial<O>);
  }
}
