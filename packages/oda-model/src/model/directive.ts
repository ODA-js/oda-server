import clean from '../lib/json/clean';
import {
  FieldArgs,
  DirectiveInput,
  DirectiveStorage,
  MetaModelType,
} from './interfaces';
import { ModelBase } from './modelbase';

export class Directive extends ModelBase {
  public modelType: MetaModelType = 'field';
  protected $obj!: DirectiveStorage;

  get args(): FieldArgs[] | undefined {
    return this.$obj.args;
  }

  get on(): string[] | undefined {
    return this.$obj.on;
  }

  public updateWith(obj: DirectiveInput) {
    if (obj) {
      super.updateWith(obj);
      this.$obj.args = obj.args;
      this.$obj.on = obj.on;
    }
  }

  // it get fixed object
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      args: props.args,
      on: props.on,
    });
  }
}
