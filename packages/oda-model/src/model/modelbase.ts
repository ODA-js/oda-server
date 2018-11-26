import * as inflected from 'inflected';

import clean from '../lib/json/clean';
import fold from './../lib/json/fold';
import { ModelBaseInput, ModelBaseStorage } from './interfaces';
import { Metadata } from './metadata';
import { ModelPackage } from './modelpackage';

export class ModelBase extends Metadata {
  protected $obj!: ModelBaseStorage;

  constructor(obj?: ModelBaseInput) {
    super(obj);
    if (obj) {
      this.updateWith(fold(obj) as ModelBaseInput);
    }
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

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public toObject(_modelPackage?: ModelPackage) {
    let props = this.$obj;
    return clean({
      ...super.toObject(),
      name: props.name,
      title: props.title,
      description: props.description,
    });
  }

  public updateWith(obj: ModelBaseInput) {
    if (obj) {
      super.updateWith(obj);

      const result: ModelBaseStorage = { ...this.$obj };

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

  public clone() {
    return new (<typeof ModelBase>this.constructor)(this.toObject());
  }
}
