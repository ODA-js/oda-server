import { Kind } from 'graphql';

import { GQLModule } from './empty';

export class JSONType extends GQLModule {
  protected _name = 'JSONType';

  protected _resolver: { [key: string]: any } = {
    JSON: {
      __serialize: identity,
      __parseValue: identity,
      __parseLiteral: parseLiteral,
    },
  };

  protected _typeDef = {
    entry: [
      `
      scalar JSON
    `,
    ],
  };
}

function identity(value) {
  return value;
}

function parseLiteral(ast) {
  let result;
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      result = ast.value;
      break;
    case Kind.INT:
    case Kind.FLOAT:
      result = parseFloat(ast.value);
      break;
    case Kind.OBJECT:
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(field.value);
      });
      result = value;
      break;
    case Kind.LIST:
      result = ast.values.map(parseLiteral);
      break;
    default:
      result = null;
      break;
  }
  return result;
}
