import { MetaModelType } from './model';
import {
  ModelBase,
  ModelBaseInput,
  ModelBaseStorage,
  IModelBase,
} from './modelbase';
import { BaseMeta } from './metadata';

/**
 * scalar item
 */
export interface IScalar extends IModelBase<ScalarMeta, ScalarInput> {}

export interface ScalarMeta extends BaseMeta {}

export interface ScalarStorage extends ModelBaseStorage<ScalarMeta> {}

export interface ScalarInput extends ModelBaseInput<ScalarMeta> {}

export class Scalar extends ModelBase<ScalarMeta, ScalarInput, ScalarStorage>
  implements IScalar {
  public modelType: MetaModelType = 'scalar';
  constructor(inp: ScalarInput) {
    super(inp);
  }
}
