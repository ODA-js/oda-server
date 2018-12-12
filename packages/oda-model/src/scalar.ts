import { merge } from 'lodash';
import { MetaModelType, Nullable } from './types';
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
const defaultInput = { metadata: defaultMetaInfo };

export class Scalar
  extends ModelBase<ScalarMetaInfo, ScalarInput, ScalarInternal, ScalarOutput>
  implements IScalar {
  public get modelType(): MetaModelType {
    return 'scalar';
  }
  constructor(init: ScalarInput) {
    super(merge({}, defaultInput, init));
  }
  public updateWith(input: Nullable<ScalarInput>) {
    super.updateWith(input);
  }
  public toObject(): ScalarOutput {
    return merge({}, super.toObject(), {} as Partial<ScalarOutput>);
  }
}
