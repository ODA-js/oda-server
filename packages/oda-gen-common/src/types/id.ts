import { Kind } from 'graphql';
import { GQLModule } from './empty';

export class IdType extends GQLModule {
  protected _name = 'IdType';
  protected _resolver: { [key: string]: any } = {
    ID: {
      __serialize: String,
      __parseValue: String,
      __parseLiteral: parseLiteral,
    },
  };
  protected _typeDef = {
    type: [
      `
      scalar ID
    `,
    ],
  };
}

function parseLiteral(ast: { kind: string; value?: string }) {
  return ast.kind === Kind.STRING ? ast.value : null;
}
