import clean from '../lib/json/clean';
import { MetaModelType, OperationStorage, OperationInput } from './interfaces';
import { FieldBase } from './fieldbase';

export class Operation extends FieldBase {
  public modelType: MetaModelType = 'operation';
  protected $obj!: OperationStorage;

  public get actionType(): string {
    return this.$obj.actionType;
  }

  public updateWith(obj: OperationInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };

      result.actionType = obj.actionType;

      this.$obj = result;
    }
  }

  // it get fixed object
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      actionType: props.actionType,
    });
  }

  // it get clean object with no default values
  public toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      actionType: props.actionType,
    });
  }
}
