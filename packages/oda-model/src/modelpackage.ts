import { MetaModelType, Nullable } from './types';
import { merge } from 'lodash';
import { assignValue } from './types';
import {
  IPackageBase,
  ModelPackageBase,
  ModelPackageBaseMetaInfo,
  ModelPackageBaseOutput,
  ModelPackageBaseInput,
  ModelPackageBaseInternal,
} from './packagebase';

export interface IPackage
  extends IPackageBase<PackageMetaInfo, ModelPackageInput, ModelPackageOutput> {
  readonly abstract: boolean;
}

export interface PackageMetaInfo extends ModelPackageBaseMetaInfo {}

export interface ModelPackageInput
  extends ModelPackageBaseInput<PackageMetaInfo> {
  abstract?: boolean;
}

export interface ModelPackageOutput
  extends ModelPackageBaseOutput<PackageMetaInfo> {
  abstract: boolean;
}

export interface ModelPackageInternal
  extends ModelPackageBaseInternal<PackageMetaInfo> {
  abstract: boolean;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

/** Model package is the storage place of Entities */
export class ModelPackage
  extends ModelPackageBase<
    PackageMetaInfo,
    ModelPackageInput,
    ModelPackageInternal,
    ModelPackageOutput
  >
  implements IPackage {
  public modelType: MetaModelType = 'package';
  public get abstract() {
    return this.$obj.abstract;
  }

  constructor(inp: ModelPackageInput | string | undefined) {
    super(
      merge(
        {},
        defaultInput,
        typeof inp === 'string'
          ? { name: inp }
          : inp !== undefined
          ? inp
          : { name: 'DefaultPackage' },
      ),
    );
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: Nullable<ModelPackageInput>) {
    super.updateWith(input);

    assignValue<ModelPackageInternal, ModelPackageInput, boolean>({
      src: this.$obj,
      input,
      field: 'abstract',
      effect: (src, value) => (src.abstract = value),
      setDefault: src => (src.abstract = false),
    });
  }

  public toObject(): ModelPackageOutput {
    return merge({}, super.toObject(), {
      abstract: this.$obj.abstract,
    } as ModelPackageOutput);
  }
}
