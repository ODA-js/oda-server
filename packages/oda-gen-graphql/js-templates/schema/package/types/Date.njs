<#@ chunks "$$$main$$$" -#>
<#@ alias 'types/Date' #>
<#- chunkStart(`./_Types/Date.ts`); -#>
import { Scalar } from '../common';
import { Kind } from 'graphql';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';

export default new Scalar({
  schema: gql`
    scalar Date
  `,
  resolver: {
    serialize: value => {
      return makeDate(value).toISOString();
    },
    parseValue: value => {
      return makeDate(value);
    },
    parseLiteral: node => {
      const { kind, value } = node;
      let result;
      switch (kind) {
        case Kind.INT:
        case Kind.FLOAT:
          result = new Date(+value);
          break;
        case Kind.STRING:
          result = new Date(value);
          break;
        default:
          throw new GraphQLError(`Expected Data value, but got: ${value}`);
      }
      return result;
    },
  },
});

function makeDate(value: string | number | Date | any): Date {
  let result;
  if (value instanceof Date) {
    result = value;
  } else if (typeof value === 'string') {
    result = new Date(value);
  } else if (typeof value === 'number') {
    result = new Date(value);
  } else {
    throw TypeError(`${value} is not Date type`);
  }
  return result;
}
