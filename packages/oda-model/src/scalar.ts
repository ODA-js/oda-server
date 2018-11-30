import { merge } from 'lodash';
import { MetaModelType } from './model';
import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
} from './modelbase';
import { ElementMetaInfo } from './element';

/**
 * scalar item
 */
export interface IScalar extends IModelBase<ScalarMetaInfo, ScalarInput> {}

export interface ScalarMetaInfo extends ElementMetaInfo {}

export interface ScalarInternal extends ModelBaseInternal<ScalarMetaInfo> {}

export interface ScalarInput extends ModelBaseInput<ScalarMetaInfo> {}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Scalar
  extends ModelBase<ScalarMetaInfo, ScalarInput, ScalarInternal>
  implements IScalar {
  public modelType: MetaModelType = 'scalar';
  constructor(inp: ScalarInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }
}
