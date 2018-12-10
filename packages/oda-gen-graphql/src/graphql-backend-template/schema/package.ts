import { ModelPackage, FieldType } from 'oda-model';
import { capitalize, printArguments } from '../utils';

export const template = 'schema/package';

export function prepare(
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter: string,
) {
  return { ctx: mapper(pack, role, aclAllow, typeMapper, adapter), template };
}

export interface MapperOutput {
  name: string;
  entities: { name: string }[];
  scalars: { name: string }[];
  directives: { name: string }[];
  enums: { name: string }[];
  mutations: MutationQueryOutput[];
  queries: MutationQueryOutput[];
  unions: {
    name: string;
    items: string[];
  }[];
  mixins: {
    name: string;
    fields: any[];
  }[];
}

import {
  getRealEntities,
  getScalars,
  getDirvectives,
  getEnums,
  getMutations,
  getQueries,
  getUnions,
  getMixins,
} from '../queries';

import {
  mapper as mutation__query__mapper,
  MutationQueryOutput,
} from './mutation-query';

import { mapper as mixin__mapper } from './mixins';

export function mapper(
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter: string,
): MapperOutput {
  const mapToGQLTypes = typeMapper.graphql;
  return {
    name: capitalize(pack.name),
    entities: getRealEntities(pack).map(e => ({
      name: e.name,
      adapter: e.getMetadata('persistence.adapter', 'mongoose'),
    })),
    scalars: getScalars(pack).map(s => ({
      name: s.name,
    })),
    directives: getDirvectives(pack).map(s => ({
      name: s.name,
      args: printArguments(s, mapToGQLTypes),
      on: s.on.join('|'),
    })),
    enums: getEnums(pack).map(s => ({
      name: s.name,
      items: s.items,
      hasCustomValue: s.items.some(i => !!i.value),
    })),
    mutations: getMutations(pack).map(m =>
      mutation__query__mapper(m, pack, typeMapper),
    ),
    queries: getQueries(pack).map(q =>
      mutation__query__mapper(q, pack, typeMapper),
    ),
    unions: getUnions(pack).map(u => ({
      name: u.name,
      items: u.items,
    })),
    mixins: getMixins(pack).map(u =>
      mixin__mapper(u, pack, role, aclAllow, typeMapper, adapter),
    ),
  };
}
