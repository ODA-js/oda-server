import { Entity, EntityInput, IEntity } from './entity';

import {
  ModelPackage,
  IPackage,
  ModelPackageInput,
  ModelPackageOutput,
  AccessAction,
} from './modelpackage';
import {
  MetaModelType,
  AsHash,
  MapToArray,
  assignValue,
  Nullable,
  ArrayToHash,
  MapToHash,
} from './types';
import fold from './lib/fold';
import { merge } from 'lodash';
import {
  IPackageBase,
  ModelPackageBaseInput,
  ModelPackageBaseMetaInfo,
  ModelPackageBaseInternal,
  ModelPackageBase,
  ModelPackageBaseOutput,
} from './packagebase';
import { getFilter } from './getFilter';
import { FieldInput, IField, isIRelationField } from './field';
import { Graph, Vertex, Edge } from './utils/detectcyclesedges';
import { IRelationField } from './relationfield';
import { Internal } from './element';
import { ModelHookInput } from './modelhooks';

export type FieldMap = {
  [name: string]: boolean;
};

export interface IModel
  extends IPackageBase<MetaModelMetaInfo, MetaModelInput, MetaModelOutput> {
  readonly packages: Map<string, IPackage>;
  readonly defaultPackage: IPackage;
  readonly abstract: boolean;
  readonly hooks: ModelHookInput[];
}

export interface MetaModelInput
  extends ModelPackageBaseInput<MetaModelMetaInfo> {
  packages?: (string | ModelPackageInput)[];
  hooks?: ModelHookInput | ModelHookInput[];
}

export interface MetaModelOutput
  extends ModelPackageBaseOutput<MetaModelMetaInfo>,
    ModelPackageOutput {
  packages: ModelPackageOutput[];
  hooks?: ModelHookInput[];
}

export interface MetaModelMetaInfo extends ModelPackageBaseMetaInfo {}

export interface MetaModelInternal extends ModelPackageBaseInternal {
  packages: Map<string, IPackage>;
  hooks: ModelHookInput[];
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

  public get defaultAccess() {
    return 'allow' as AccessAction;
  }

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
    return this[Internal].packages;
  }

  public get hooks() {
    return this[Internal].hooks;
  }

  public get extends() {
    return new Set();
  }

  constructor(init: MetaModelInput) {
    super(merge({}, defaultInput, init));
    this.ensureDefaultPackage();
    this.applyHooks();
    this.build();
  }

  private ensureDefaultPackage() {
    if (!this.packages.has(this.name)) {
      this.packages.set(this.name, this);
    }
  }

  public toObject(): MetaModelOutput {
    this.packages.delete(this.name);
    return merge({}, super.toObject(), {
      packages: MapToArray(this[Internal].packages, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<MetaModelOutput>);
  }

  // extracts packages from loaded model
  public discoverPackages() {
    const packages: { [key: string]: boolean } = {};
    this.packages.forEach(p => {
      packages[p.name] = true;
    });

    this.entities.forEach(e => {
      extract(e.metadata.acl.create, packages);
      extract(e.metadata.acl.delete, packages);
      extract(e.metadata.acl.readMany, packages);
      extract(e.metadata.acl.readOne, packages);
      extract(e.metadata.acl.update, packages);
      e.fields.forEach(f => {
        extract(f.metadata.acl.read, packages);
        extract(f.metadata.acl.update, packages);
        if (isIRelationField(f)) {
          extract(f.metadata.acl.create, packages);
          extract(f.metadata.acl.delete, packages);
        }
      });
      e.operations.forEach(o => {
        extract(o.metadata.acl.execute, packages);
      });
    });

    this.mixins.forEach(mix => {
      extract(mix.metadata.acl.create, packages);
      extract(mix.metadata.acl.delete, packages);
      extract(mix.metadata.acl.readMany, packages);
      extract(mix.metadata.acl.readOne, packages);
      extract(mix.metadata.acl.update, packages);
      mix.fields.forEach(f => {
        extract(f.metadata.acl.read, packages);
        extract(f.metadata.acl.update, packages);
        if (isIRelationField(f)) {
          extract(f.metadata.acl.create, packages);
          extract(f.metadata.acl.delete, packages);
        }
      });
      mix.operations.forEach(o => {
        extract(o.metadata.acl.execute, packages);
      });
    });

    this.mutations.forEach(e => {
      extract(e.metadata.acl.execute, packages);
    });
    this.queries.forEach(e => {
      extract(e.metadata.acl.execute, packages);
    });
    return packages;
  }

  public updateWith(input: Nullable<MetaModelInput>) {
    super.updateWith(input);

    assignValue<
      MetaModelInternal,
      MetaModelInput,
      NonNullable<MetaModelInput['packages']>
    >({
      src: this[Internal],
      input,
      field: 'packages',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        src.packages = new Map(value
          .map(i => {
            let res: IPackage;
            if (typeof i === 'string') {
              res = new ModelPackage({ name: i });
            } else {
              res = new ModelPackage(i);
            }
            return [res.name, res];
          })
          .filter(f => f) as [string, IPackage][]);
      },
      required: true,
      setDefault: src => (src.packages = new Map<string, IPackage>()),
    });

    assignValue<
      MetaModelInternal,
      MetaModelInput,
      NonNullable<MetaModelInput['hooks']>
    >({
      src: this[Internal],
      input,
      field: 'hooks',
      allowEffect: (_, value) =>
        !!(value && ((Array.isArray(value) && value.length > 0) || value)),
      effect: (src, value) => {
        if (!Array.isArray(value)) {
          value = [fold(value) as ModelHookInput];
        }
        src.hooks = fold(value.filter(f => f)) as ModelHookInput[];
      },
      required: true,
      setDefault: src => (src.hooks = []),
    });
  }

  public mergeWith(_payload: Nullable<MetaModelInput>) {
    // super.mergeWith(payload);
  }

  protected applyEntityHook(entity: IEntity, hook: EntityInput): IEntity {
    let result = entity.toObject();
    if (hook.fields && Array.isArray(hook.fields)) {
      hook.fields = ArrayToHash(hook.fields);
    }
    const fields = MapToHash<IField, FieldInput>(entity.fields, (_name, v) =>
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

  public applyHooks() {
    this.hooks.forEach(hook => {
      if (hook.entities && this.entities.size > 0) {
        let keys = Object.keys(hook.entities);
        for (let i = 0, len = keys.length; i < len; i++) {
          let key = keys[i];
          let current = hook.entities[key];
          let prepare = getFilter(key);
          let list = Array.from(this.entities.values()).filter(prepare.filter);
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
          let list = Array.from(this.mutations.values()).filter(prepare.filter);
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

  public reset() {
    this.updateWith({ name: this.name });
    this.ensureDefaultPackage();
    this.isBuilt = false;
  }
  /** stores package dependencies graph */
  private _packageDeps!: Graph<IPackage>;
  /** stores implementation inheritance graph */
  private _inheritance!: Graph<IEntity>;
  /** stores reference graph */
  private _references!: Graph<IEntity, IRelationField>;
  private isBuilt: boolean = false;

  public build() {
    if (!this.isBuilt) {
      this._packageDeps = new Graph(
        [...this[Internal].packages.values()],
        'extends',
      );
      if (this._packageDeps.hasCycle()) {
        throw new Error(
          "package dependencies has cycles, so it can't be build",
        );
      }

      this._inheritance = new Graph(
        [...this[Internal].entities.values()],
        'implements',
      );
      if (this._inheritance.hasCycle()) {
        throw new Error("entity inheritance has cycles, so it can't be build");
      }

      this._references = new Graph(
        [...this[Internal].entities.values()],
        'relations',
        (
          graph: Graph<IEntity, IRelationField>,
          source: Vertex<IEntity, IRelationField>,
        ) => {
          const entity = source.node;
          entity.relations.forEach(f => {
            if (entity.fields.has(f)) {
              const field = entity.fields.get(f) as IRelationField;
              const dest = graph.vertices.get(field.relation.ref.entity);
              if (dest) {
                const edge = new Edge<IEntity, IRelationField>(source, dest);
                /** put it to graph edges */
                graph.edges.add(edge);
                /** put it to source Vertex */
                source.edges.add(edge);
                /** put it to des Vertex */
                dest.edges.add(edge);
              }
            }
          });
          return [] as Iterable<Edge<IEntity, IRelationField>>;
        },
      );
      //dummy

      // this[Internal].packages.forEach(pack => {
      //   // pack.queries.
      // });

      this._references;
      this.isBuilt = true;
    }
  }
}

function extract(src: string[], p: { [key: string]: boolean }) {
  src.forEach(s => {
    if (!p.hasOwnProperty(s)) {
      p[s] = false;
    }
  });
}

// function mergeEntity(
//   objValue: any,
//   srcValue: any,
//   key: keyof EntityInput,
//   object: EntityInput,
//   source: EntityInput,
//   stack: string[],
// ) {}
