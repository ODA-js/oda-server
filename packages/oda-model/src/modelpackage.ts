import { MetaModelType, Nullable, HashToArray } from './types';
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
import { MutationInput } from './mutation';
import { OperationInput } from './operation';
import { QueryInput } from './query';
import { EntityInput } from './entity';
import { EntityBaseMetaInfoACL } from './entitybase';
import { FieldInput, isSimpleInput } from './field';
import { RelationFieldBaseMetaInfoACL } from './relationfieldbase';
import { FieldBaseMetaInfoACL } from './fieldbase';

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

  /**
   * fixe mutation ACL
   * @param input Mutation
   */
  public fixACLMutation(input: MutationInput | OperationInput | QueryInput) {
    if (!input.metadata) {
      input.metadata = {};
    }
    if (!input.metadata.acl) {
      input.metadata.acl = { execute: [] };
    }
    if (input.metadata.acl.execute.indexOf(this.name) < 0) {
      input.metadata.acl.execute.push(this.name);
    }
  }

  public fixACLEntity(input: EntityInput) {
    if (input.metadata) {
      input.metadata = input.metadata;
    } else {
      input.metadata = {} as any;
    }
    const aclKeys: (keyof EntityBaseMetaInfoACL)[] = [
      'create',
      'delete',
      'update',
      'readOne',
      'readMany',
    ];
    if (input.metadata && !input.metadata.acl) {
      input.metadata.acl = {} as any;
    }

    aclKeys.forEach((i: keyof EntityBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (!input.metadata.acl[i]) {
          input.metadata.acl[i] = [];
        }
      }
    });

    aclKeys.forEach((i: keyof EntityBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (
          input.metadata.acl[i] &&
          input.metadata.acl[i].indexOf(this.name) < 0
        ) {
          input.metadata.acl[i].push(this.name);
        }
      }
    });
    if (input.fields) {
      if (!Array.isArray(input.fields)) {
        input.fields = HashToArray(input.fields);
      }
      input.fields.forEach(this.fixACLField);
    }
  }

  public fixACLField(input: FieldInput) {
    if (!input.metadata) {
      input.metadata = {};
    }
    if (!input.metadata.acl) {
      input.metadata.acl = {} as any;
    }
    const aclFieldKeys: (keyof FieldBaseMetaInfoACL)[] = ['read', 'update'];
    aclFieldKeys.forEach((i: keyof FieldBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (!input.metadata.acl[i]) {
          input.metadata.acl[i] = [];
        }
      }
    });

    aclFieldKeys.forEach((i: keyof FieldBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (
          input.metadata.acl[i] &&
          input.metadata.acl[i].indexOf(this.name) < 0
        ) {
          input.metadata.acl[i].push(this.name);
        }
      }
    });

    if (!isSimpleInput(input)) {
      const aclRelKeys: (keyof RelationFieldBaseMetaInfoACL)[] = [
        'create',
        'delete',
      ];
      aclRelKeys.forEach((i: keyof RelationFieldBaseMetaInfoACL) => {
        if (input.metadata && input.metadata.acl) {
          if (!input.metadata.acl[i]) {
            input.metadata.acl[i] = [];
          }
        }
      });

      aclRelKeys.forEach((i: keyof RelationFieldBaseMetaInfoACL) => {
        if (input.metadata && input.metadata.acl) {
          if (
            input.metadata.acl[i] &&
            input.metadata.acl[i].indexOf(this.name) < 0
          ) {
            input.metadata.acl[i].push(this.name);
          }
        }
      });
    }
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
