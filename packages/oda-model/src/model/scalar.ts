import { MetaModelType, ScalarInput, ScalarStorage } from './interfaces';
import { ModelBase } from './modelbase';

export class Scalar extends ModelBase {
  protected $obj!: ScalarStorage;
  public modelType: MetaModelType = 'scalar';
  public updateWith(obj: ScalarInput) {
    super.updateWith(obj);
    this.$obj = {
      ...this.$obj,
      ...obj,
    };
  }
  public toObject() {
    return this.$obj;
  }
}
