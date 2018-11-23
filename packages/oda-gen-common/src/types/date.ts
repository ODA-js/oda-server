import { Kind } from 'graphql';
import { GraphQLError } from 'graphql';
import { GQLModule } from './empty';

// import { GraphQLScalarType } from 'graphql';

export class DateType extends GQLModule {
  protected _name = 'DateType';

  protected _resolver: { [key: string]: any } = {
    Date: {
      __serialize: value => {
        return makeDate(value).toISOString();
      },
      __parseValue: value => {
        return makeDate(value);
      },
      __parseLiteral: node => {
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
  };

  protected _typeDef = {
    type: [
      `
      scalar Date
    `,
    ],
  };
}

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
