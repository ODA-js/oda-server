import * as inflected from 'inflected';
import {
  BaseMeta,
  MetadataStorage,
  MetadataInput,
  Metadata,
  IMeta,
} from './metadata';
import { MetaModelType, INamed } from './model';
import { merge } from 'lodash';

/**
 * the base model item
 */
export interface IModelBase<T extends ModelMeta, K extends MetadataInput<T>>
  extends IMeta<T, K>,
    INamed {
  /**
   * the kind of current item
   */
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

export interface ModelMeta extends BaseMeta {}

export interface ModelBaseStorage<T extends ModelMeta>
  extends MetadataStorage<T> {
  name: string;
  title?: string;
  description?: string;
}

export interface ModelBaseInput<T extends ModelMeta> extends MetadataInput<T> {
  name: string;
  title?: string;
  description?: string;
}

export abstract class ModelBase<
  T extends BaseMeta,
  I extends ModelBaseInput<T>,
  S extends ModelBaseStorage<T>
> extends Metadata<T, I, S> implements IModelBase<T, I> {
  readonly modelType: MetaModelType = 'metadata';
  constructor(inp: ModelBaseInput<T>) {
    super(inp);
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

  public toObject(): I {
    return merge(super.toObject(), {
      name: this.name,
      title: this.title,
      description: this.description,
    });
  }

  /**
   * update Modelbase
   * @param obj update payload
   */
  public updateWith(obj: Partial<I>) {
    super.updateWith(obj);
    if (obj.name) {
      this.$obj.name = inflected.camelize(obj.name.trim(), false);
    }
    if (obj.title) {
      this.$obj.title = inflected.titleize(obj.title.trim());
    }
    if (obj.description) {
      this.$obj.description = obj.description.trim();
    }
  }
}
