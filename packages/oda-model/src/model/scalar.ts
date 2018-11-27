import {
  MetaModelType,
  ScalarInput,
  ScalarStorage,
  ScalarMeta,
} from './interfaces';
import { ModelBase } from './modelbase';

export class Scalar extends ModelBase<ScalarMeta, ScalarInput, ScalarStorage> {
  public modelType: MetaModelType = 'scalar';
}
