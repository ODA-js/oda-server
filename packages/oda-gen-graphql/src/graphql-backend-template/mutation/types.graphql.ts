import { Factory } from 'fte.js';
import { printRequired } from '../utils';
import { ModelPackage, FieldArgs, FieldType } from 'oda-model';

export const template = 'mutation/types.graphql.njs';

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

export interface MutationInput {
  name: string;
  description: string;
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface MapperOutput {
  name: string;
  args: {
    name: string;
    type: string;
  }[];
  payload: {
    name: string;
    type: string;
  }[];
}

export function mapper(
  mutation: MutationInput,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  const mapToGQLTypes = typeMapper.graphql;
  return {
    name: mutation.name,
    args: mutation.args.map(arg => ({
      name: arg.name,
      type: `${mapToGQLTypes(arg.type)}${printRequired(arg)}`,
    })),
    payload: mutation.payload.map(arg => ({
      name: arg.name,
      type: `${mapToGQLTypes(arg.type)}${printRequired(arg)}`,
    })),
  };
}
