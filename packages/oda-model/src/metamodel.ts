import * as fs from 'fs';

import { Entity, EntityInput, IEntity } from './entity';

import {
  ModelPackage,
  IPackage,
  PackageMetaInfo,
  ModelPackageInternal,
  ModelPackageInput,
  ModelPackageOutput,
} from './modelpackage';
import { Mutation, MutationInput, IMutation } from './mutation';
import { Query, QueryInput, IQuery } from './query';
import { Mixin, MixinInput, IMixin } from './mixin';
import { Union, UnionInput, IUnion } from './union';
import { Enum, EnumInput, IEnum } from './enum';
import { Scalar, ScalarInput, IScalar } from './scalar';
import { Directive, DirectiveInput, IDirective } from './directive';
import {
  MetaModelType,
  AsHash,
  MapToArray,
  assignValue,
  Nullable,
} from './types';
import {
  IModelBase,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBase,
} from './modelbase';
import fold from './lib/json/fold';
import { IField } from './field';
import { merge } from 'lodash';
import { SimpleFieldInput } from './simplefield';
import {
  IPackageBase,
  ModelPackageBaseInput,
  ModelPackageBaseMetaInfo,
  ModelPackageBaseInternal,
  ModelPackageBase,
} from './packagebase';

type FieldMap = {
  [name: string]: boolean;
};

function getFilter(
  inp: string,
): { filter: (f: IField) => boolean; fields: string[] } {
  let result = {
    filter: (f: IField) => f.name === inp,
    fields: [inp],
  };
  if (inp === '*') {
    result.filter = () => true;
  }
  if (inp.startsWith('^[')) {
    let notFields = inp
      .slice(2, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce(
        (res, cur) => {
          res[cur] = true;
          return res;
        },
        {} as FieldMap,
      );
    result.filter = (f: IField) => !notFields[f.name];
    result.fields = [];
  }
  if (inp.startsWith('[')) {
    let onlyFields = inp
      .slice(1, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce(
        (res, cur) => {
          res[cur] = true;
          return res;
        },
        {} as FieldMap,
      );
    result.filter = (f: IField) => !!onlyFields[f.name];
    result.fields = Object.keys(onlyFields);
  }
  return result;
}

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
const defaultInternal = {};
const defaultInput = {};

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

  constructor(inp: MetaModelInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
    this.ensureDefaultPackage();
  }

  private ensureDefaultPackage() {
    if (!this.packages.has(this.name)) {
      this.ensureAll();
      this.packages.set(this.name, this);
    }
  }

  public toObject(): MetaModelOutput {
    return merge({}, super.toObject(), {
      packages: MapToArray(this.$obj.packages).map(i => i.toObject()),
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
      effect: (src, value) => (src.packages = value),
      setDefault: src => (src.packages = new Map<string, IPackage>()),
      required: true,
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
          res[curr.name] = deepMerge(res[curr.name], curr);
        }
        return res;
      },
      {} as { [key: string]: SimpleFieldInput },
    );
  }

  protected applyEntityHook(entity: Entity, hook: EntityInput): Entity {
    let result = entity.toJSON();
    let metadata;
    if (hook.metadata) {
      metadata = deepMerge(result.metadata || {}, hook.metadata);
    }
    let fields: {
      [fName: string]: SimpleFieldInput;
    };

    if (Array.isArray(hook.fields)) {
      fields = this.dedupeFields([
        ...(result.fields as SimpleFieldInput[]),
        ...(hook.fields as SimpleFieldInput[]),
      ]);
    } else {
      fields = this.dedupeFields(result.fields || []);
      let fNames = Object.keys(hook.fields || {});
      for (let i = 0, len = fNames.length; i < len; i++) {
        let fName = fNames[i];
        let prepare = getFilter(fName);
        let list = (result.fields || []).filter(prepare.filter);
        if (list.length > 0 && hook.fields !== undefined) {
          list.forEach(f => {
            if (hook.fields) {
              fields[f.name] = deepMerge(f, hook.fields[fName] as any);
            }
          });
        } else {
          // create specific items
          prepare.fields.forEach(f => {
            fields[f] = hook.fields[fName];
          });
        }
      }
    }
    return new Entity({
      ...result,
      fields: fields !== undefined ? fields : undefined,
      metadata,
    });
  }

  protected applyMutationHook(
    mutation: Mutation,
    hook: MutationInput,
  ): Mutation {
    let result = mutation.toObject();
    let metadata;
    if (hook.metadata) {
      metadata = deepMerge(result.metadata || {}, hook.metadata);
    }

    let args = result.args,
      payload = result.payload;
    if (hook.args) {
      args = [...args, ...hook.args];
    }

    if (hook.payload) {
      payload = [...payload, ...hook.payload];
    }

    result = {
      ...result,
      args,
      payload,
      metadata,
    };
    return new Mutation(result);
  }

  protected applyQueryHook(mutation: Query, hook: QueryInput): Query {
    let result = mutation.toJSON() as MutationInput;
    let metadata;
    if (hook.metadata) {
      metadata = deepMerge(result.metadata || {}, hook.metadata);
    }

    let args = result.args,
      payload = result.payload;
    if (hook.args) {
      args = [...args, ...hook.args];
    }

    if (hook.payload) {
      payload = [...payload, ...hook.payload];
    }

    result = {
      ...result,
      args,
      payload,
      metadata,
    };
    return new Query(result);
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
            current.fields = current.fields ? current.fields : [];
            current.metadata = current.metadata ? current.metadata : {};
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
            current.args = current.args ? current.args : [];
            current.payload = current.payload ? current.payload : [];
            current.metadata = current.metadata ? current.metadata : {};

            let prepare = getFilter(key);
            let list = Array.from(this.mutations.values()).filter(
              prepare.filter,
            );
            if (list.length > 0) {
              list.forEach(e => {
                let result = this.applyMutationHook(e, current);
                this.mutations.set(result.name, result);
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
            current.args = current.args ? current.args : [];
            current.payload = current.payload ? current.payload : [];
            current.metadata = current.metadata ? current.metadata : {};

            let prepare = getFilter(key);
            let list = Array.from(this.queries.values()).filter(prepare.filter);
            if (list.length > 0) {
              list.forEach(e => {
                let result = this.applyQueryHook(e, current);
                this.queries.set(result.name, result);
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

  public addPackage(pckg: ModelPackageInput) {
    let pack: ModelPackage;
    if (pckg.name && this.packages.has(pckg.name)) {
      pack = this.packages.get(pckg.name) as ModelPackage;
    } else {
      pack = new ModelPackage(pckg);
      pack.connect(this);
      this.packages.set(pckg.name, pack);
    }

    if (pack && pckg.mixins) {
      pckg.mixins.forEach(e => {
        if (this.mixins.has(e) && !pack.mixins.has(e)) {
          pack.addMixin(this.mixins.get(e));
        }
      });
    }

    if (pckg.entities) {
      pckg.entities.forEach(e => {
        if (this.entities.has(e) && !pack.entities.has(e)) {
          pack.addEntity(this.entities.get(e));
        }
      });
    }

    if (pckg.mutations) {
      pckg.mutations.forEach(m => {
        if (this.mutations.has(m) && !pack.mutations.has(m)) {
          pack.addMutation(this.mutations.get(m));
        }
      });
    }

    if (pckg.queries) {
      pckg.queries.forEach(e => {
        if (this.queries.has(e) && !pack.queries.has(e)) {
          pack.addQuery(this.queries.get(e));
        }
      });
    }

    if (pckg.enums) {
      pckg.enums.forEach(e => {
        if (this.enums.has(e) && !pack.enums.has(e)) {
          pack.addEnum(this.enums.get(e));
        }
      });
    }

    if (pckg.scalars) {
      pckg.scalars.forEach(e => {
        if (this.scalars.has(e) && !pack.scalars.has(e)) {
          pack.addScalar(this.scalars.get(e));
        }
      });
    }

    if (pckg.directives) {
      pckg.directives.forEach(e => {
        if (this.directives.has(e) && !pack.directives.has(e)) {
          pack.addDirective(this.directives.get(e));
        }
      });
    }

    if (pckg.unions) {
      pckg.unions.forEach(e => {
        if (this.unions.has(e) && !pack.unions.has(e)) {
          pack.addUnion(this.unions.get(e));
        }
      });
    }

    pack.ensureAll();
  }

  public loadPackage(store: MetaModelInput, hooks?: any[]) {
    this.reset();
    this.updateWith(store);

    this.ensureDefaultPackage();

    this.applyHooks(fold(hooks) as IModelHook[]);
  }

  public reset() {
    this.updateWith({ name: this.name });
    this.ensureDefaultPackage();
  }
}
