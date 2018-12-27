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
import { Internal } from './element';
import capitalize from './lib/capitalize';

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
  extends?: string[] | string;
}

export interface ModelPackageOutput
  extends ModelPackageBaseOutput<PackageMetaInfo> {
  abstract: boolean;
  defaultAccess: AccessAction;
  extends: string[];
}

export interface ModelPackageInternal extends ModelPackageBaseInternal {
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
    return this[Internal].abstract;
  }
  public get defaultAccess() {
    return this[Internal].defaultAccess;
  }

  public get extends() {
    return this[Internal].extends;
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
      src: this[Internal],
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
      src: this[Internal],
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
      src: this[Internal],
      input,
      field: 'extends',
      effect: (src, value) => {
        if (!Array.isArray(value)) {
          value = [value];
        }
        src.extends = new Set<string>(value.map(v => capitalize(v)));
      },
      required: true,
      setDefault: src => (src.extends = new Set<string>()),
    });
  }

  public toObject(): ModelPackageOutput {
    return merge({}, super.toObject(), {
      abstract: this[Internal].abstract,
      defaultAccess: this[Internal].defaultAccess,
      extends: [...this.extends],
    } as ModelPackageOutput);
  }

  public mergeWith(_payload: Nullable<ModelPackageInput>) {
    // super.mergeWith(payload);
  }
}
