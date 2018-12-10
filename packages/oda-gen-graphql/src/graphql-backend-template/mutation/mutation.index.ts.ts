import { Mutation, ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';
import * as schema from './index';
import { capitalize } from '../utils';

export const template = 'mutation/mutation.index.ts.njs';

export function generate(
  te: Factory,
  mutation: Mutation,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(mutation, pack, typeMapper), template);
}

export interface MapperOutput {
  name: string;
  partials: {
    entry: schema.entry.MapperOutput;
    types: schema.types.MapperOutput;
  };
}

export function mapper(
  mutation: Mutation,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: capitalize(mutation.name),
    partials: {
      entry: schema.entry.mapper(mutation, pack, typeMapper),
      types: schema.types.mapper(mutation, pack, typeMapper),
    },
  };
}
