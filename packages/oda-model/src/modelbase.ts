import {
  ElementMetaInfo,
  ElementInternal,
  ElementInput,
  Element,
  IMeta,
  ElementOutput,
  Internal,
} from './element';
import { MetaModelType, INamed } from './types';
import { merge } from 'lodash';
import { Nullable, assignValue } from './types';

export interface ModelBaseMetaInfo extends ElementMetaInfo {}

export interface ModelBaseInternal extends ElementInternal {
  name: string;
  title?: string;
  description?: string;
}

export interface ModelBaseInput<T extends ModelBaseMetaInfo>
  extends ElementInput<T> {
  name: string;
  title?: string;
  description?: string;
}

export interface ModelBaseOutput<T extends ModelBaseMetaInfo>
  extends ElementOutput<T> {
  name: string;
  title?: string;
  description?: string;
}

/**
 * the base model item
 */
export interface IModelBase<
  T extends ModelBaseMetaInfo,
  I extends ModelBaseInput<T>,
  O extends ModelBaseOutput<T>
> extends IMeta<T, I, O>, INamed {
  readonly modelType: MetaModelType;
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

export const modelBaseDefaultMetaInfo = {};
export const modelBaseDefaultInput = { metadata: modelBaseDefaultMetaInfo };

export class ModelBase<
  T extends ElementMetaInfo,
  I extends ModelBaseInput<T>,
  S extends ModelBaseInternal,
  O extends ModelBaseOutput<T>
> extends Element<T, I, S, O> implements IModelBase<T, I, O> {
  public get modelType(): MetaModelType {
    return 'metadata';
  }
  constructor(init: ModelBaseInput<T>) {
    super(merge({}, modelBaseDefaultInput, init));
  }
  get name(): string {
    return this[Internal].name;
  }

  get title(): string | undefined {
    return this[Internal].title;
  }

  get description(): string | undefined {
    return this[Internal].description;
  }

  /**
   * update Modelbase
   * @param input update payload
   */
  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<S, I, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = value.trim()),
      required: true,
    });

    assignValue<S, I, string>({
      src: this[Internal],
      input,
      field: 'title',
      effect: (src, value) => (src.title = value.trim()),
    });

    assignValue<S, I, string>({
      src: this[Internal],
      input,
      field: 'description',
      effect: (src, value) => (src.description = value.trim()),
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
