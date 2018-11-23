import { GQLModule } from './empty';

export class WhereID extends GQLModule {
  protected _name = 'WhereID';
  protected _typeDef = {
    entry: [
      `
      input WhereID {
        eq: ID
        ne: ID
        in: [ID!]
        nin: [ID!]
        and: [WhereID!]
        or: [WhereID!]
        nor: [WhereID!]
        not: [WhereID!]
        exists: Boolean
      }
  `,
    ],
  };
}
