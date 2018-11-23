import clean from '../lib/json/clean';
import { FieldArgs, MutationInput, MutationStorage } from './interfaces';
import { ModelBase } from './modelbase';

export class Mutation extends ModelBase {
  protected $obj!: MutationStorage;

  public get args(): FieldArgs[] {
    return this.$obj.args_;
  }

  public get payload(): FieldArgs[] {
    return this.$obj.payload_;
  }

  public updateWith(obj: MutationInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };

      let args = obj.args;
      let $args = obj.args;

      let payload = obj.payload;
      let $payload = obj.payload;

      result.args = args;
      result.args_ = $args;

      result.payload = payload;
      result.payload_ = $payload;

      this.$obj = result;
    }
  }

  // it get fixed object
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      args: props.args ? props.args : undefined,
      payload: props.payload ? props.payload : undefined,
    });
  }

  // it get clean object with no default values
  public toJSON(): MutationInput {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      args: props.args_ ? props.args_ : undefined,
      payload: props.payload_ ? props.payload_ : undefined,
    });
  }
}
