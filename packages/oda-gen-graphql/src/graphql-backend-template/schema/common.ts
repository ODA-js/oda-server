import { Entity, ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
export const template = 'schema/common.ts.njs';

import * as entityMappers from './../entity';
import * as ensure from './ensure';

type MapperOutput = {};

export function prepare(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter: string,
) {
  return {
    ctx: mapper(entity, pack, role, aclAllow, typeMapper, adapter),
    template,
  };
}

export function mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
  adapter: string,
): MapperOutput {
  return {
    name: entity.name,
    type: {
      resolver: entityMappers.type.resolver.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      entry: entityMappers.type.entry.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
    },
    connections: {
      types: entityMappers.connections.types.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      mutations: {
        resolver: entityMappers.connections.mutations.resolver.mapper(
          entity,
          pack,
          role,
          aclAllow,
          typeMapper,
          adapter,
        ),
        types: entityMappers.connections.mutations.types.mapper(
          entity,
          pack,
          role,
          aclAllow,
          typeMapper,
          adapter,
        ),
      },
    },
    mutations: {
      resolver: entityMappers.mutations.resolver.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      types: entityMappers.mutations.types.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
    },
    query: {
      resolver: entityMappers.query.resolver.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      entry: entityMappers.query.entry.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      sortOrder: entityMappers.type.enums.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      filter: entityMappers.type.entry.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
    },
    subscriptions: {
      ...entityMappers.subscriptions.resolver.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      ...entityMappers.subscriptions.types.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
    },
    ensure: ensure.mapper(entity, pack, role, aclAllow, typeMapper, adapter),
    data: {
      name: entity.name,
      adapter,
      schema: entityMappers.data.adapter.schema.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      connector: entityMappers.data.adapter.connector.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      model: entityMappers.data.types.model.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
    },
    dataPump: {
      config: entityMappers.dataPump.config.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
      queries: entityMappers.dataPump.queries.mapper(
        entity,
        pack,
        role,
        aclAllow,
        typeMapper,
        adapter,
      ),
    },
  };
}
