import {
  MetaModelType,
  ScalarInput,
  ScalarStorage,
  ScalarMeta,
  IScalar,
} from './interfaces';
import { ModelBase } from './modelbase';

export class Scalar extends ModelBase<ScalarMeta, ScalarInput, ScalarStorage>
  implements IScalar {
  public modelType: MetaModelType = 'scalar';
  constructor(inp: ScalarInput) {
    super(inp);
  }
}
