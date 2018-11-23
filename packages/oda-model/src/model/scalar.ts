import { MetaModelType, ScalarInput } from './interfaces';
import { ModelBase } from './modelbase';

export class Scalar extends ModelBase {
  public modelType: MetaModelType = 'scalar';
  constructor(obj: ScalarInput) {
    super(obj);
  }
  public updateWith(obj: ScalarInput) {
    if (obj) {
      super.updateWith(obj);
      const result = { ...this.$obj };
      result.name = obj.name;
    }
  }
}
