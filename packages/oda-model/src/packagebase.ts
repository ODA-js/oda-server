import {
  IModelBase,
  ModelBaseMetaInfo,
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
import {
  MetaModelType,
  Nullable,
  ArrayToMap,
  AssignAndKillDupes,
} from './types';
import { IModel } from './metamodel';
import { merge } from 'lodash';
import { MapToArray, assignValue } from './types';
import { Internal } from './element';
import capitalize from './lib/capitalize';

export interface IPackageBase<
  M extends ModelPackageBaseMetaInfo,
  I extends ModelPackageBaseInput<M>,
  O extends ModelPackageBaseOutput<M>
> extends IModelBase<M, I, O> {
  readonly metaModel: IModel;
  readonly entities: Map<string, IEntity>;
  readonly mixins: Map<string, IMixin>;
  readonly mutations: Map<string, IMutation>;
  readonly queries: Map<string, IQuery>;
  readonly enums: Map<string, IEnum>;
  readonly scalars: Map<string, IScalar>;
  readonly unions: Map<string, IUnion>;
  readonly directives: Map<string, IDirective>;
}

export interface ModelPackageBaseMetaInfo extends ModelBaseMetaInfo {}

export interface ModelPackageBaseInput<M extends ModelPackageBaseMetaInfo>
  extends ModelBaseInput<M> {
  entities?: (string | EntityInput)[];
  mixins?: (string | MixinInput)[];
  mutations?: (string | MutationInput)[];
  queries?: (string | QueryInput)[];
  enums?: (string | EnumInput)[];
  scalars?: (string | ScalarInput)[];
  unions?: (string | UnionInput)[];
  directives?: (string | DirectiveInput)[];
}

export interface ModelPackageBaseOutput<M extends ModelPackageBaseMetaInfo>
  extends ModelBaseOutput<M> {
  entities: (EntityInput)[];
  mixins: (MixinInput)[];
  mutations: (MutationInput)[];
  queries: (QueryInput)[];
  enums: (EnumInput)[];
  scalars: (ScalarInput)[];
  unions: (UnionInput)[];
  directives: (DirectiveInput)[];
}

export interface ModelPackageBaseInternal extends ModelBaseInternal {
  entities: Map<string, IEntity>;
  mixins: Map<string, IMixin>;
  mutations: Map<string, IMutation>;
  queries: Map<string, IQuery>;
  enums: Map<string, IEnum>;
  scalars: Map<string, IScalar>;
  unions: Map<string, IUnion>;
  directives: Map<string, IDirective>;
  metaModel: IModel;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

/** Model package is the storage place of Entities */
export class ModelPackageBase<
  M extends ModelPackageBaseMetaInfo,
  I extends ModelPackageBaseInput<M>,
  S extends ModelPackageBaseInternal,
  O extends ModelPackageBaseOutput<M>
> extends ModelBase<M, I, S, O> implements IPackageBase<M, I, O> {
  public get modelType(): MetaModelType {
    return 'package-base';
  }
  public get metaModel() {
    return this[Internal].metaModel;
  }
  public get entities() {
    return this[Internal].entities;
  }
  public get mixins() {
    return this[Internal].mixins;
  }
  public get mutations() {
    return this[Internal].mutations;
  }
  public get queries() {
    return this[Internal].queries;
  }
  public get enums() {
    return this[Internal].enums;
  }
  public get scalars() {
    return this[Internal].scalars;
  }
  public get unions() {
    return this[Internal].unions;
  }
  public get directives() {
    return this[Internal].directives;
  }

  constructor(init: I) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<ModelPackageBaseInternal, I, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = capitalize(value)),
      required: true,
    });

    assignValue<S, I, IModel>({
      src: this[Internal],
      input,
      field: 'metaModel',
      effect: (src, value) => (src.metaModel = value),
    });

    assignValue<S, I, (EntityInput | string)[]>({
      src: this[Internal],
      input,
      field: 'entities',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const entities =
          (this.metaModel && this.metaModel.entities) || new Map();
        const process = AssignAndKillDupes(entities, Entity);
        src.entities = ArrayToMap<any, IEntity>(
          value,
          (i: string | EntityInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      required: true,
      setDefault: src => (src.entities = new Map<string, IEntity>()),
    });

    assignValue<S, I, (EnumInput | string)[]>({
      src: this[Internal],
      input,
      field: 'enums',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const enums = (this.metaModel && this.metaModel.enums) || new Map();
        const process = AssignAndKillDupes(enums, Enum);
        src.enums = ArrayToMap<any, IEnum>(
          value,
          (i: string | EnumInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.enums = new Map<string, IEnum>()),
    });

    assignValue<S, I, (ScalarInput | string)[]>({
      src: this[Internal],
      input,
      field: 'scalars',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const scalars = (this.metaModel && this.metaModel.scalars) || new Map();
        const process = AssignAndKillDupes(scalars, Scalar);
        src.scalars = ArrayToMap<any, IScalar>(
          value,
          (i: string | ScalarInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.scalars = new Map<string, IScalar>()),
    });

    assignValue<S, I, (DirectiveInput | string)[]>({
      src: this[Internal],
      input,
      field: 'directives',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const directives =
          (this.metaModel && this.metaModel.directives) || new Map();
        const process = AssignAndKillDupes(directives, Directive);
        src.directives = ArrayToMap<any, IDirective>(
          value,
          (i: string | DirectiveInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.directives = new Map<string, IDirective>()),
    });

    assignValue<S, I, (MixinInput | string)[]>({
      src: this[Internal],
      input,
      field: 'mixins',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const mixins = (this.metaModel && this.metaModel.mixins) || new Map();
        const process = AssignAndKillDupes(mixins, Mixin);
        src.mixins = ArrayToMap<any, IMixin>(
          value,
          (i: string | MixinInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.mixins = new Map<string, IMixin>()),
    });

    assignValue<S, I, (UnionInput | string)[]>({
      src: this[Internal],
      input,
      field: 'unions',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const unions = (this.metaModel && this.metaModel.unions) || new Map();
        const process = AssignAndKillDupes(unions, Union);
        src.unions = ArrayToMap<any, IUnion>(
          value,
          (i: string | UnionInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.unions = new Map<string, IUnion>()),
    });

    assignValue<S, I, (MutationInput | string)[]>({
      src: this[Internal],
      input,
      field: 'mutations',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const mutations =
          (this.metaModel && this.metaModel.mutations) || new Map();
        const process = AssignAndKillDupes(mutations, Mutation);
        src.mutations = ArrayToMap<any, IMutation>(
          value,
          (i: string | MutationInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.mutations = new Map<string, IMutation>()),
    });

    assignValue<S, I, (QueryInput | string)[]>({
      src: this[Internal],
      input,
      field: 'queries',
      allowEffect: (_, value) => value.length > 0,
      effect: (src, value) => {
        const queries = (this.metaModel && this.metaModel.queries) || new Map();
        const process = AssignAndKillDupes(queries, Query);
        src.queries = ArrayToMap<any, IQuery>(
          value,
          (i: string | QueryInput) => process(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        );
      },
      setDefault: src => (src.queries = new Map<string, IQuery>()),
    });
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      directives: MapToArray(this[Internal].directives, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      enums: MapToArray(this[Internal].enums, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      queries: MapToArray(this[Internal].queries, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      unions: MapToArray(this[Internal].unions, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      mixins: MapToArray(this[Internal].mixins, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      mutations: MapToArray(this[Internal].mutations, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      entities: MapToArray(this[Internal].entities, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as O);
  }

  public mergeWith(_payload: Nullable<I>) {
    // super.mergeWith(payload);
  }
}
// function AssignAndKillDupes(i: string | EntityInput, entities: Map<string, IEntity>) {
//   let res: IEntity | undefined;
//   if (typeof i === 'string') {
//     res = entities.get(i);
//     if (!res) {
//       res = new Entity({ name: i });
//       entities.set(res.name, res);
//     }
//   }
//   else {
//     res = new Entity(i);
//     const original = entities.get(res.name);
//     if (original) {
//       original.mergeWith(res.toObject());
//     }
//   }
//   return res;
// }
