import { Entity, ModelPackage } from 'oda-model';
import { Factory } from 'fte.js';
import * as schema from './index';
import { memoizeEntityMapper } from '../queries';
import { FieldType } from 'oda-model';

export const template = 'entity/type.index.ts.njs';

export function generate(
  te: Factory,
  entity: Entity,
  pack: ModelPackage,
  role: string,
  allowAcl,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(entity, pack, role, allowAcl, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  partials: {
    enums: schema.type.enums.MapperOutput;
    type: schema.type.entry.MapperOutput;
    'connections.types': schema.connections.types.MapperOutput;
    'connections.mutation': schema.connections.mutations.types.MapperOutput;
    'connections.mutation.entry': schema.connections.mutations.entry.MapperOutput;
    'mutation.types': schema.mutations.types.MapperOutput;
    'mutation.entry': schema.mutations.entry.MapperOutput;
    'subscription.types': schema.subscriptions.types.MapperOutput;
    'subscription.entry': schema.subscriptions.entry.MapperOutput;
    'query.entry': schema.query.entry.MapperOutput;
    'viewer.entry': schema.viewer.entry.MapperOutput;
  };
}

export const mapper = memoizeEntityMapper(template, _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  allowAcl,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: entity.name,
    partials: {
      enums: schema.type.enums.mapper(entity, pack, role, allowAcl, typeMapper),
      type: schema.type.entry.mapper(entity, pack, role, allowAcl, typeMapper),
      'connections.types': schema.connections.types.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'connections.mutation': schema.connections.mutations.types.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'connections.mutation.entry': schema.connections.mutations.entry.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'mutation.types': schema.mutations.types.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'mutation.entry': schema.mutations.entry.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'subscription.types': schema.subscriptions.types.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'subscription.entry': schema.subscriptions.entry.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'query.entry': schema.query.entry.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
      'viewer.entry': schema.viewer.entry.mapper(
        entity,
        pack,
        role,
        allowAcl,
        typeMapper,
      ),
    },
  };
}
