import { getWithType } from 'oda-api-graphql';
import { common } from 'oda-gen-graphql';

let { fillDefaults } = common.lib;

export class NodeEntity extends common.types.GQLModule {
  protected _name = 'NodeEntity';
  constructor(_args) {
    super(_args);

    this._resolver = fillDefaults(this._resolver, {
      Node: {
        __resolveType(obj, context, info) {
          if (obj && obj.__type__) {
            return info.schema.getType(obj.__type__);
          } else {
            return null;
          }
        },
      },
    });

    this._query = fillDefaults(this._query, {
      async node(_, {id}, context, info) {
        throw new Error('!!!deprecated!!!') 
      },
    });

    this._typeDef = fillDefaults(this._typeDef ,{
      'queryEntry': [`
      interface Node {
        id: ID!
      }
      `],
    });

    this._queryEntry = fillDefaults(this._queryEntry, {
      'queryEntry': [`
        node(id: ID!): Node
      `],
    });
  }
}
