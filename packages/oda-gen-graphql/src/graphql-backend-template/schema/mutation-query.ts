import { printRequired } from '../utils';
import { ModelPackage, FieldArgs, FieldType } from 'oda-model';

export interface MutationInput {
  name: string;
  description: string;
  args: FieldArgs[];
  payload: FieldArgs[];
}

export interface MutationQueryOutput {
  name: string;
  args: {
    name: string;
    type: {
      ts: string;
      gql: string;
    };
  }[];
  payload: {
    name: string;
    type: {
      ts: string;
      gql: string;
    };
  }[];
}

export function mapper(
  mutation: MutationInput,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MutationQueryOutput {
  const mapToTSTypes = typeMapper.typescript;
  const mapToGQLTypes = typeMapper.graphql;
  return {
    name: mutation.name,
    args: mutation.args.map(arg => ({
      name: arg.name,
      type: {
        ts: mapToTSTypes(arg.type),
        gql: `${mapToGQLTypes(arg.type)}${printRequired(arg)}`,
      },
    })),
    payload: mutation.payload.map(arg => ({
      name: arg.name,
      type: {
        ts: mapToTSTypes(arg.type),
        gql: `${mapToGQLTypes(arg.type)}${printRequired(arg)}`,
      },
    })),
  };
}
