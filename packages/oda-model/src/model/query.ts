import clean from '../lib/json/clean';
import { FieldArgs, QueryInput, QueryStorage } from './interfaces';
import { ModelBase } from './modelbase';
import { IQuery } from './interfaces/model';

export class Query extends ModelBase implements IQuery {
  protected $obj!: QueryStorage;

  public get args(): FieldArgs[] {
    return this.$obj.args;
  }

  public get payload(): FieldArgs[] {
    return this.$obj.payload;
  }

  public updateWith(obj: QueryInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };

      let args = obj.args;

      let payload = obj.payload;

      result.args = args;

      result.payload = payload;

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
}
