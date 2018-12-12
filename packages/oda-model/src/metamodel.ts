import * as fs from 'fs';

import { Entity, EntityInput, IEntity } from './entity';

import {
  ModelPackage,
  IPackage,
  ModelPackageInput,
  ModelPackageOutput,
} from './modelpackage';
import { MutationInput } from './mutation';
import { QueryInput } from './query';
import {
  MetaModelType,
  AsHash,
  MapToArray,
  assignValue,
  Nullable,
  createOrMergeFromMap,
  ArrayToHash,
  MapToHash,
} from './types';
import { ModelBaseOutput } from './modelbase';
import fold from './lib/fold';
import { merge } from 'lodash';
import { SimpleFieldInput } from './simplefield';
import {
  IPackageBase,
  ModelPackageBaseInput,
  ModelPackageBaseMetaInfo,
  ModelPackageBaseInternal,
  ModelPackageBase,
} from './packagebase';
import { getFilter } from './getFilter';
import { FieldInput, IField } from './field';

export type FieldMap = {
  [name: string]: boolean;
};

export interface IModelHook {
  name: string;
  entities?: AsHash<EntityInput>;
  mutations?: AsHash<MutationInput>;
  queries?: AsHash<QueryInput>;
}

export interface IModel
  extends IPackageBase<MetaModelMetaInfo, MetaModelInput, MetaModelOutput> {}

export interface MetaModelInput
  extends ModelPackageBaseInput<MetaModelMetaInfo> {
  packages?: (string | ModelPackageInput)[];
  store?: string;
}

export interface MetaModelOutput
  extends ModelBaseOutput<MetaModelMetaInfo>,
    ModelPackageOutput {
  packages: ModelPackageOutput[];
  store: string;
}

export interface MetaModelMetaInfo extends ModelPackageBaseMetaInfo {}

export interface MetaModelInternal
  extends ModelPackageBaseInternal<MetaModelMetaInfo> {
  packages: Map<string, IPackage>;
  store: string;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

/**
 * Represents meta-model store
 */
export class MetaModel
  extends ModelPackageBase<
    MetaModelMetaInfo,
    MetaModelInput,
    MetaModelInternal,
    MetaModelOutput
  >
  implements IModel, IPackage {
  public get modelType(): MetaModelType {
    return 'model';
  }

  public store: string = 'default.json';

  public get defaultPackage(): IPackage {
    return this;
  }

  public get metaModel() {
    return this;
  }

  public get abstract() {
    return false;
  }

  public get packages() {
    return this.$obj.packages;
  }

  constructor(init: MetaModelInput) {
    super(merge({}, defaultInput, init));
    this.ensureDefaultPackage();
  }

  private ensureDefaultPackage() {
    if (!this.packages.has(this.name)) {
      this.ensureAll();
      this.packages.set(this.name, this);
    }
  }

  public toObject(): MetaModelOutput {
    this.packages.delete(this.name);
    return merge({}, super.toObject(), {
      packages: MapToArray(this.$obj.packages, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<MetaModelOutput>);
  }

  public updateWith(input: Nullable<MetaModelInput>) {
    super.updateWith(input);

    assignValue<MetaModelInternal, MetaModelInput, string>({
      src: this.$obj,
      input,
      field: 'store',
      effect: (src, value) => (src.store = value),
      setDefault: src => (src.store = 'model.json'),
      required: true,
    });

    assignValue<
      MetaModelInternal,
      MetaModelInput,
      NonNullable<MetaModelInput['packages']>
    >({
      src: this.$obj,
      input,
      field: 'packages',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const createIt = createOrMergeFromMap(
          this.metaModel,
          ModelPackage,
          'packages',
        );
        src.packages = new Map(value
          .map(i => {
            const pkg = createIt(i);
            return pkg;
          })
          .filter(f => f) as [string, IPackage][]);
      },
      required: true,
      setDefault: src => (src.packages = new Map<string, IPackage>()),
    });
  }

  public loadModel(fileName: string = this.store) {
    let txt = fs.readFileSync(fileName);
    let store = JSON.parse(txt.toString()) as MetaModelInput;
    this.loadPackage(store);
  }

  protected dedupeFields(
    src: SimpleFieldInput[],
  ): { [key: string]: SimpleFieldInput } {
    return src.reduce(
      (res, curr) => {
        if (!res.hasOwnProperty(curr.name)) {
          res[curr.name] = curr;
        } else {
          res[curr.name] = merge(res[curr.name], curr);
        }
        return res;
      },
      {} as { [key: string]: SimpleFieldInput },
    );
  }

  protected applyEntityHook(entity: IEntity, hook: EntityInput): IEntity {
    let result = entity.toObject();
    if (hook.fields && Array.isArray(hook.fields)) {
      hook.fields = ArrayToHash(hook.fields);
    }
    const fields = MapToHash<IField, FieldInput>(entity.fields, v =>
      v.toObject(),
    );
    if (hook.fields) {
      for (let fName in hook.fields) {
        let prepare = getFilter(fName);
        let list = (result.fields || []).filter(prepare.filter);
        if (list.length > 0) {
          list.forEach(f => {
            fields[f.name] = merge(f, (hook.fields as AsHash<FieldInput>)[
              fName
            ] as any);
          });
        } else {
          // create specific items
          prepare.fields.forEach(f => {
            fields[f] = (hook.fields as AsHash<FieldInput>)[fName];
          });
        }
      }
    }

    return new Entity({
      ...result,
      fields,
    });
  }

  public applyHooks(hooks?: IModelHook[]) {
    if (hooks && !Array.isArray(hooks)) {
      hooks = [hooks];
    }
    if (hooks) {
      hooks = hooks.filter(f => f);
      hooks.forEach(hook => {
        if (hook.entities && this.entities.size > 0) {
          let keys = Object.keys(hook.entities);
          for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let current = hook.entities[key];
            let prepare = getFilter(key);
            let list = Array.from(this.entities.values()).filter(
              prepare.filter,
            );
            if (list.length > 0) {
              list.forEach(e => {
                let result = this.applyEntityHook(e, current);
                this.entities.set(result.name, result);
              });
            } else if (prepare.fields.length > 0) {
              throw new Error(
                `Entit${prepare.fields.length === 1 ? 'y' : 'ies'} ${
                  prepare.fields
                } not found`,
              );
            }
          }
        }
        if (hook.mutations && this.mutations.size > 0) {
          let keys = Object.keys(hook.mutations);
          for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let current = hook.mutations[key];
            let prepare = getFilter(key);
            let list = Array.from(this.mutations.values()).filter(
              prepare.filter,
            );
            if (list.length > 0) {
              list.forEach(e => {
                e.updateWith(merge({}, e.toObject(), current));
                this.mutations.set(e.name, e);
              });
            } else if (prepare.fields.length > 0) {
              throw new Error(
                `Mutation${prepare.fields.length > 1 ? 's' : ''} ${
                  prepare.fields
                } not found`,
              );
            }
          }
        }
        if (hook.queries && this.queries.size > 0) {
          let keys = Object.keys(hook.queries);
          for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let current = hook.queries[key];
            let prepare = getFilter(key);
            let list = Array.from(this.queries.values()).filter(prepare.filter);
            if (list.length > 0) {
              list.forEach(e => {
                e.updateWith(merge({}, e.toObject(), current));
                this.queries.set(e.name, e);
              });
            } else if (prepare.fields.length > 0) {
              throw new Error(
                `Quer${prepare.fields.length > 1 ? 'ies' : 'y'} ${
                  prepare.fields
                } not found`,
              );
            }
          }
        }
      });
    }
  }

  public addPackage(pkg: ModelPackageInput) {
    let pack: ModelPackage;
    if (pkg.name && this.packages.has(pkg.name)) {
      pack = this.packages.get(pkg.name) as ModelPackage;
    } else {
      pack = new ModelPackage(pkg);
      pack.connect(this);
      this.packages.set(pkg.name, pack);
    }

    pack.updateWith(merge({}, pack.toObject(), pkg));

    pack.ensureAll();
  }

  public loadPackage(store: MetaModelInput, hooks?: any[]) {
    this.reset();
    this.updateWith(store);

    this.ensureDefaultPackage();
    if (hooks) {
      this.applyHooks(fold(hooks) as IModelHook[]);
    }
  }

  public reset() {
    this.updateWith({ name: this.name });
    this.ensureDefaultPackage();
  }
}
