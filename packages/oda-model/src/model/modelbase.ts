import * as inflected from 'inflected';

import {
  ModelBaseInput,
  ModelBaseStorage,
  IValidate,
  ValidationResultInput,
  IValidator,
  BaseMeta,
} from './interfaces';
import { Metadata } from './metadata';

export abstract class ModelBase<
  T extends BaseMeta,
  I extends ModelBaseInput<T>,
  S extends ModelBaseStorage
> extends Metadata<T, I> implements IValidate {
  protected $obj!: S;
  constructor(inp: ModelBaseInput<T>) {
    super(inp);
  }
  get name(): string {
    return this.$obj.name;
  }

  get title(): string {
    return this.$obj.title;
  }

  get description(): string {
    return this.$obj.description;
  }

  public validate(validator: IValidator): ValidationResultInput[] {
    return validator.check(this);
  }

  public toObject(): I {
    return {
      ...super.toObject(),
      name: this.name,
      title: this.title,
      description: this.description,
    };
  }

  public updateWith(obj: I) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };

      let $name = obj.name;
      let $title = obj.title;
      let $description = obj.description;

      let name = inflected.camelize($name.trim(), false);

      let title = $title ? $title.trim() : '';

      let description = $description ? $description.trim() : '';

      if (!title) {
        title = inflected.titleize(name);
      }

      if (!description) {
        description = title || $title || '';
      }
      description = inflected.titleize(description);

      result.name = name;

      result.title = title;

      result.description = description;
      this.$obj = result;
    }
  }
}
