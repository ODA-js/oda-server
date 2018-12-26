import { Nullable, MetaModelType } from './types';
import {
  IPackageBase,
  ModelPackageBaseInput,
  ModelPackageBaseMetaInfo,
  ModelPackageBaseInternal,
  ModelPackageBase,
  ModelPackageBaseOutput,
} from './packagebase';
import { merge } from 'lodash';

export interface ModelHookInput {}

/**
 * union definition
 */
export interface IModelHook
  extends IPackageBase<ModelHookMetaInfo, ModelHookInput, ModelHookOutput> {}

export interface ModelHookMetaInfo extends ModelPackageBaseMetaInfo {}

export interface ModelHookInternal extends ModelPackageBaseInternal {}

export interface ModelHookInput
  extends ModelPackageBaseInput<ModelHookMetaInfo> {}

export interface ModelHookOutput
  extends ModelPackageBaseOutput<ModelHookMetaInfo> {}

export const modelHookDefaultMetaInfo = {};
export const modelHookDefaultInput = { metadata: modelHookDefaultMetaInfo };

export interface ModelHook {}

export class ModelHook
  extends ModelPackageBase<
    ModelHookMetaInfo,
    ModelHookInput,
    ModelHookInternal,
    ModelHookOutput
  >
  implements IModelHook {
  public get modelType(): MetaModelType {
    return 'model-hook';
  }

  constructor(init: ModelHookInput) {
    super(merge({}, modelHookDefaultInput, init));
  }

  public updateWith(input: Nullable<ModelHookInput>) {
    if (input.entities) {
      input.entities.forEach(e => {
        if (typeof e !== 'string') {
          e.exact = true;
        }
      });
    }
    if (input.mixins) {
      input.mixins.forEach(e => {
        if (typeof e !== 'string') {
          e.exact = true;
        }
      });
    }
    super.updateWith(input);
  }

  public toObject(): ModelHookOutput {
    return merge({}, super.toObject(), {} as Partial<ModelHookOutput>);
  }
}
