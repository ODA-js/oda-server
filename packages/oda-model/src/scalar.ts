import { merge } from 'lodash';
import { MetaModelType, Nullable } from './types';
import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';

/**
 * scalar item
 */
export interface IScalar
  extends IModelBase<ScalarMetaInfo, ScalarInput, ScalarOutput> {}

export interface ScalarMetaInfo extends ModelBaseMetaInfo {}

export interface ScalarInternal extends ModelBaseInternal {}

export interface ScalarInput extends ModelBaseInput<ScalarMetaInfo> {}
export interface ScalarOutput extends ModelBaseOutput<ScalarMetaInfo> {}

export const scalarDefaultMetaInfo = {};
export const scalarDefaultInput = { metadata: scalarDefaultMetaInfo };

export class Scalar
  extends ModelBase<ScalarMetaInfo, ScalarInput, ScalarInternal, ScalarOutput>
  implements IScalar {
  public get modelType(): MetaModelType {
    return 'scalar';
  }
  constructor(init: ScalarInput) {
    super(merge({}, scalarDefaultInput, init));
  }
  public updateWith(input: Nullable<ScalarInput>) {
    super.updateWith(input);
  }
  public toObject(): ScalarOutput {
    return merge({}, super.toObject(), {} as Partial<ScalarOutput>);
  }
  public mergeWith(input: Nullable<ScalarInput>) {
    super.mergeWith(input);
  }
}
