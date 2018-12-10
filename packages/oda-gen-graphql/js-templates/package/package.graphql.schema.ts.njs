<#@ context 'pack' -#>
// tslint:disable:no-unused-variable
import { common } from 'oda-gen-graphql';
const { deepMerge } = common.lib;

import { #{pack.name}Package } from './index';

export class #{pack.name}Schema extends common.types.GQLModule {
  protected _name = '#{pack.name}Schema';
  protected _composite = [
    new #{pack.name}Package({}),
  ];

  public get typeDefs() {
    return `
      ${this.typeDef.join('\n  ')}

      type Viewer implements Node {
        id: ID!
        ${this.viewerEntry.join('\n  ')}
      }

      type RootQuery {
        ${this.queryEntry.join('\n  ')}
      }

      type RootMutation {
        ${this.mutationEntry.join('\n  ')}
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
      `;
  }

  public build() {
    super.build();
    this._resolver = deepMerge(
      this.resolver,
      this.viewer,
      {
        RootQuery: this.query,
        RootMutation: this.mutation,
      },
    );
  }

  public get resolvers() {
    return this.applyHooks(this.resolver);
  }

}



