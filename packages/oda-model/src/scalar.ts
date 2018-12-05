import { merge } from 'lodash';
import { MetaModelType, Nullable } from './model';
import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
  ModelBaseOutput,
} from './modelbase';
import { ElementMetaInfo } from './element';

/**
 * scalar item
 */
export interface IScalar
  extends IModelBase<ScalarMetaInfo, ScalarInput, ScalarOutput> {}

export interface ScalarMetaInfo extends ElementMetaInfo {}

export interface ScalarInternal extends ModelBaseInternal<ScalarMetaInfo> {}

export interface ScalarInput extends ModelBaseInput<ScalarMetaInfo> {}
export interface ScalarOutput extends ModelBaseOutput<ScalarMetaInfo> {}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Scalar
  extends ModelBase<ScalarMetaInfo, ScalarInput, ScalarInternal, ScalarOutput>
  implements IScalar {
  public modelType: MetaModelType = 'scalar';
  constructor(inp: ScalarInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }
  public updateWith(input: Nullable<ScalarInput>) {
    super.updateWith(input);
  }
  public toObject(): ScalarOutput {
    return merge({}, super.toObject(), {} as Partial<ScalarOutput>);
  }
}
