import { ModelPackage, FieldType } from 'oda-model';
import { Factory } from 'fte.js';

export const template = 'mutation/entry.graphql.njs';

export interface MutationInput {
  name: string;
}

export function generate(
  te: Factory,
  mutation: MutationInput,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(mutation, pack, typeMapper), template);
}

export interface MapperOutput {
  name: string;
}

export function mapper(
  mutation: MutationInput,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  return {
    name: mutation.name,
  };
}
