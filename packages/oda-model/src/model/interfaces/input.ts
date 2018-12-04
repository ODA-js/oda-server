import { FieldArgs, AsHash, OperationKind } from './types';
import { EntityBaseMeta, EntityMeta, MixinMeta, PackageMeta } from './metadata';

export interface EntityInput extends EntityBaseInput<EntityMeta> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface ModelPackageInput extends ModelBaseInput<PackageMeta> {
  name: string;
  title?: string;
  description?: string;
  abstract?: boolean;
  entities: string[];
  mutations: any[];
  queries: any[];
  directives: any[];
  scalars: any[];
  enums: any[];
  mixins: any[];
  unions: any[];
}

export interface MetaModelInput extends ModelBaseInput<ModelMeta> {
  entities: EntityInput[];
  packages: ModelPackageInput[];
  mutations?: MutationInput[];
  queries?: QueryInput[];
  scalars: ScalarInput[];
  directives: DirectiveInput[];
  enums?: EnumInput[];
  unions?: UnionInput[];
  mixins?: MixinInput[];
  name: string;
  title?: string;
  description?: string;
}

export interface IModelHook {
  name: string;
  entities?: AsHash<EntityInput>;
  mutations?: AsHash<MutationInput>;
  queries?: AsHash<QueryInput>;
}
