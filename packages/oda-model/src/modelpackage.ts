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

export type AccessAction = 'allow' | 'prohibit';

export interface IPackage
  extends IPackageBase<PackageMetaInfo, ModelPackageInput, ModelPackageOutput> {
  readonly abstract: boolean;
  readonly defaultAccess: AccessAction;
  readonly extends: Set<string>;
}

export interface PackageMetaInfo extends ModelPackageBaseMetaInfo {}

export interface ModelPackageInput
  extends ModelPackageBaseInput<PackageMetaInfo> {
  abstract?: boolean;
  defaultAccess?: AccessAction;
  extends?: string[];
}

export interface ModelPackageOutput
  extends ModelPackageBaseOutput<PackageMetaInfo> {
  abstract: boolean;
  defaultAccess: AccessAction;
  extends: string[];
}

export interface ModelPackageInternal
  extends ModelPackageBaseInternal<PackageMetaInfo> {
  abstract: boolean;
  defaultAccess: AccessAction;
  extends: Set<string>;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

/** Model package is the storage place of Entities */
export class ModelPackage
  extends ModelPackageBase<
    PackageMetaInfo,
    ModelPackageInput,
    ModelPackageInternal,
    ModelPackageOutput
  >
  implements IPackage {
  public get modelType(): MetaModelType {
    return 'package';
  }
  public get abstract() {
    return this.$obj.abstract;
  }
  public get defaultAccess() {
    return this.$obj.defaultAccess;
  }

  public get extends() {
    return this.$obj.extends;
  }

  constructor(init: ModelPackageInput | string | undefined) {
    super(
      merge(
        {},
        defaultInput,
        typeof init === 'string'
          ? { name: init }
          : init !== undefined
          ? init
          : { name: 'DefaultPackage' },
      ),
    );
  }

  public updateWith(input: Nullable<ModelPackageInput>) {
    super.updateWith(input);

    assignValue<ModelPackageInternal, ModelPackageInput, boolean>({
      src: this.$obj,
      input,
      field: 'abstract',
      effect: (src, value) => (src.abstract = value),
      required: true,
      setDefault: src => (src.abstract = false),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      NonNullable<ModelPackageInput['defaultAccess']>
    >({
      src: this.$obj,
      input,
      field: 'defaultAccess',
      effect: (src, value) => (src.defaultAccess = value),
      required: true,
      setDefault: src => (src.defaultAccess = 'allow'),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      NonNullable<ModelPackageInput['extends']>
    >({
      src: this.$obj,
      input,
      field: 'extends',
      effect: (src, value) => (src.extends = new Set<string>(value)),
      required: true,
      setDefault: src => (src.extends = new Set<string>()),
    });
  }

  public toObject(): ModelPackageOutput {
    return merge({}, super.toObject(), {
      abstract: this.$obj.abstract,
      defaultAccess: this.$obj.defaultAccess,
      extends: [...this.extends],
    } as ModelPackageOutput);
  }
}
