import {
  IModelBase,
  ModelMetaInfo,
  ModelBaseInput,
  ModelBase,
  ModelBaseInternal,
  ModelBaseOutput,
} from './modelbase';
import { IEntity, EntityInput, Entity } from './entity';
import { IScalar, ScalarInput, Scalar } from './scalar';
import { IMixin, MixinInput, Mixin } from './mixin';
import { IEnum, EnumInput, Enum } from './enum';
import { IUnion, UnionInput, Union } from './union';
import { IMutation, MutationInput, Mutation } from './mutation';
import { IQuery, QueryInput, Query } from './query';
import { IDirective, DirectiveInput, Directive } from './directive';
import { MetaModelType, Nullable } from './types';
import { IRelationField } from './relationfield';
import { IModel } from './metamodel';
import { merge } from 'lodash';
import { MapToArray, assignValue, createFromMap } from './types';
import { IField } from './field';

export interface IPackage
  extends IModelBase<PackageMetaInfo, ModelPackageInput, ModelPackageOutput> {
  readonly abstract: boolean;
  readonly metaModel: IModel;
  readonly entities: Map<string, IEntity>;
  readonly scalars: Map<string, IScalar>;
  readonly mixins: Map<string, IMixin>;
  readonly enums: Map<string, IEnum>;
  readonly unions: Map<string, IUnion>;
  readonly mutations: Map<string, IMutation>;
  readonly queries: Map<string, IQuery>;
  readonly directives: Map<string, IDirective>;
  readonly identityFields: Map<string, IEntity>;
  readonly relations: Map<string, Map<string, IRelationField>>;
}

export interface PackageMetaInfo extends ModelMetaInfo {}

export interface ModelPackageInput extends ModelBaseInput<PackageMetaInfo> {
  abstract?: boolean;
  entities?: (string | EntityInput)[];
  mutations?: (string | MutationInput)[];
  queries?: (string | QueryInput)[];
  directives?: (string | DirectiveInput)[];
  scalars?: (string | ScalarInput)[];
  enums?: (string | EnumInput)[];
  mixins?: (string | MixinInput)[];
  unions?: (string | UnionInput)[];
  metaModel?: IModel;
}

export interface ModelPackageOutput extends ModelBaseOutput<PackageMetaInfo> {
  abstract: boolean;
  entities: (EntityInput)[];
  mutations: (MutationInput)[];
  queries: (QueryInput)[];
  directives: (DirectiveInput)[];
  scalars: (ScalarInput)[];
  enums: (EnumInput)[];
  mixins: (MixinInput)[];
  unions: (UnionInput)[];
}

export interface ModelPackageInternal
  extends ModelBaseInternal<PackageMetaInfo> {
  abstract: boolean;
  /** entity storage */
  entities: Map<string, IEntity>;
  scalars: Map<string, IScalar>;
  directives: Map<string, IDirective>;
  mixins: Map<string, IMixin>;
  unions: Map<string, IUnion>;
  enums: Map<string, IEnum>;
  /** Identity fields cache */
  identityFields: Map<string, IEntity>;
  /** relation cache */
  relations: Map<string, Map<string, IRelationField>>;
  mutations: Map<string, IMutation>;
  queries: Map<string, IQuery>;
  metaModel: IModel;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

/** Model package is the storage place of Entities */
export class ModelPackage
  extends ModelBase<
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
  public get entities() {
    return this.$obj.entities;
  }
  public get enums() {
    return this.$obj.enums;
  }
  public get scalars() {
    return this.$obj.scalars;
  }
  public get directives() {
    return this.$obj.directives;
  }
  public get mixins() {
    return this.$obj.mixins;
  }
  public get unions() {
    return this.$obj.unions;
  }
  public get mutations() {
    return this.$obj.mutations;
  }
  public get queries() {
    return this.$obj.queries;
  }
  public get identityFields() {
    return this.$obj.identityFields;
  }
  public get relations() {
    return this.$obj.relations;
  }
  public get metaModel() {
    return this.$obj.metaModel;
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

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (EntityInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'entities',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Entity, 'entities');
          src.entities = new Map(value.map(i => createIt(i)).filter(f => f) as [
            string,
            IEntity
          ][]);
        }
      },
      setDefault: src => (src.entities = new Map<string, IEntity>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (EnumInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'enums',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Enum, 'enums');
          src.enums = new Map(value.map(i => createIt(i)).filter(f => f) as [
            string,
            IEnum
          ][]);
        }
      },
      setDefault: src => (src.enums = new Map<string, IEnum>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (ScalarInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'scalars',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Scalar, 'enums');
          src.scalars = new Map(value.map(i => createIt(i)).filter(f => f) as [
            string,
            IScalar
          ][]);
        }
      },
      setDefault: src => (src.scalars = new Map<string, IScalar>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (DirectiveInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'enums',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Directive, 'directives');
          src.directives = new Map(value
            .map(i => createIt(i))
            .filter(f => f) as [string, IDirective][]);
        }
      },
      setDefault: src => (src.directives = new Map<string, IDirective>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (MixinInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'mixins',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Mixin, 'mixins');
          src.mixins = new Map(value.map(i => createIt(i)).filter(f => f) as [
            string,
            IMixin
          ][]);
        }
      },
      setDefault: src => (src.mixins = new Map<string, IMixin>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (UnionInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'unions',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Union, 'unions');
          src.unions = new Map(value.map(i => createIt(i)).filter(f => f) as [
            string,
            IUnion
          ][]);
        }
      },
      setDefault: src => (src.unions = new Map<string, IUnion>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (MutationInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'mutations',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Mutation, 'mutations');
          src.mutations = new Map(value
            .map(i => createIt(i))
            .filter(f => f) as [string, IMutation][]);
        }
      },
      setDefault: src => (src.mutations = new Map<string, IMutation>()),
    });

    assignValue<
      ModelPackageInternal,
      ModelPackageInput,
      (QueryInput | string)[]
    >({
      src: this.$obj,
      input,
      field: 'queries',
      effect: (src, value) => {
        if (value.length > 0) {
          const createIt = createFromMap(this, Query, 'queries');
          src.queries = new Map(value.map(i => createIt(i)).filter(f => f) as [
            string,
            IQuery
          ][]);
        }
      },
      setDefault: src => (src.queries = new Map<string, IQuery>()),
    });

    assignValue<ModelPackageInternal, ModelPackageInput, IModel>({
      src: this.$obj,
      input,
      field: 'metaModel',
      effect: (src, value) => (src.metaModel = value),
    });
  }

  public toObject(): ModelPackageOutput {
    return merge({}, super.toObject(), {
      abstract: this.$obj.abstract,
      directives: MapToArray(this.$obj.directives).map(i => i.toObject()),
      enums: MapToArray(this.$obj.enums).map(i => i.toObject()),
      queries: MapToArray(this.$obj.queries).map(i => i.toObject()),
      unions: MapToArray(this.$obj.unions).map(i => i.toObject()),
      mixins: MapToArray(this.$obj.mixins).map(i => i.toObject()),
      mutations: MapToArray(this.$obj.mutations).map(i => i.toObject()),
      entities: MapToArray(this.$obj.entities).map(i => i.toObject()),
    } as ModelPackageOutput);
  }

  public connect(metaModel: IModel) {
    this.$obj.metaModel = metaModel;
  }

  /** add entity to Package */
  public addEntity(entity?: Entity) {
    if (entity instanceof Entity) {
      this.entities.set(entity.name, entity);
      this.ensureIds(entity);
    }
    this.ensureEntity(entity);
    return entity;
  }

  public addMutation(mutation?: Mutation) {
    if (mutation instanceof Mutation) {
      this.mutations.set(mutation.name, mutation);
    }
    this.ensureMutation(mutation);
    return mutation;
  }

  public addQuery(query?: Query) {
    if (query instanceof Query) {
      this.queries.set(query.name, query);
    }
    this.ensureQuery(query);
    return query;
  }

  public addUnion(uni?: Union) {
    if (uni instanceof Union) {
      this.unions.set(uni.name, uni);
    }
    this.ensureUnion(uni);
    return uni;
  }

  public addEnum(enu?: Enum) {
    if (enu instanceof Enum) {
      this.enums.set(enu.name, enu);
    }
    this.ensureEnum(enu);
    return enu;
  }

  public addMixin(mix?: Mixin) {
    if (mix instanceof Mixin) {
      this.mixins.set(mix.name, mix);
      // no need to do this
      // intrf.ensureIds(this);
    }
    this.ensureMixin(mix);
    return mix;
  }

  public addScalar(scalar?: Scalar) {
    if (scalar instanceof Scalar) {
      this.scalars.set(scalar.name, scalar);
    }
    this.ensureScalar(scalar);
    return scalar;
  }

  public addDirective(directive?: Directive) {
    if (directive instanceof Directive) {
      this.directives.set(directive.name, directive);
    }
    this.ensureDirective(directive);
    return directive;
  }

  /** ensure all foreign keys */
  public ensureAll() {
    this.entities.forEach(e => {
      this.ensureMixins(e);
      this.ensureFKs(e);
    });
  }

  private ensureFKs(e: IEntity) {
    let modelRelations = this.relations.get(e.name);
    if (!modelRelations) {
      modelRelations = new Map();
      this.relations.set(e.name, modelRelations);
    }

    e.relations.forEach(value => {
      let ref = e.fields.get(value) as IRelationField;
      if (ref && modelRelations) {
        modelRelations.set(ref.name, ref);
      }
    });
  }

  private ensureMixins(e: IEntity) {
    const fields = new Map<string, IField>();
    e.implements.forEach(i => {
      const impl = this.mixins.get(i);
      if (impl) {
        impl.fields.forEach(f => {
          if (!e.fields.has(f.name)) {
            fields.set(f.name, f);
          }
        });
      }
    });
    if (fields.size) {
      const update = e.toObject();
      update.fields.push(...[...fields.values()].map(f => f.toObject()));
      e.updateWith({ fields: update.fields } as Nullable<EntityInput>);
    }
  }

  public ensureIds(entity: IEntity) {
    entity.identity.forEach(value => {
      let ids = entity.fields.get(value);
      if (ids) {
        this.identityFields.set(ids.idKey.toString(), entity);
      }
    });
  }

  public removeIds(entity: IEntity) {
    entity.identity.forEach(value => {
      let ids = entity.fields.get(value);
      if (ids) {
        this.identityFields.delete(ids.idKey.toString());
      }
    });
  }

  private ensureEntity(entity?: Entity) {
    if (entity && !this.metaModel.entities.has(entity.name)) {
      this.metaModel.entities.set(entity.name, entity);
    }
  }

  private ensureMutation(mutation?: Mutation) {
    if (mutation && !this.metaModel.mutations.has(mutation.name)) {
      this.metaModel.mutations.set(mutation.name, mutation);
    }
  }

  private ensureQuery(query?: Query) {
    if (query && !this.metaModel.queries.has(query.name)) {
      this.metaModel.queries.set(query.name, query);
    }
  }

  private ensureMixin(mixin?: Mixin) {
    if (mixin && !this.metaModel.mixins.has(mixin.name)) {
      this.metaModel.mixins.set(mixin.name, mixin);
    }
  }

  private ensureScalar(scalar?: Scalar) {
    if (scalar && !this.metaModel.scalars.has(scalar.name)) {
      this.metaModel.scalars.set(scalar.name, scalar);
    }
  }

  private ensureDirective(directive?: Directive) {
    if (directive && !this.metaModel.directives.has(directive.name)) {
      this.metaModel.directives.set(directive.name, directive);
    }
  }

  private ensureUnion(uni?: Union) {
    if (uni && !this.metaModel.unions.has(uni.name)) {
      this.metaModel.unions.set(uni.name, uni);
    }
  }

  private ensureEnum(enu?: Enum) {
    if (enu && !this.metaModel.enums.has(enu.name)) {
      this.metaModel.enums.set(enu.name, enu);
    }
  }
}
