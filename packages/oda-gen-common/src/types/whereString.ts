import { GQLModule } from './empty';

export class WhereString extends GQLModule {
  protected _name = 'WhereString';
  protected _typeDef = {
    entry: [
      `
      input WhereString {
        eq: String
        ne: String
        in: [String!]
        nin: [String!]
        and: [WhereString!]
        or: [WhereString!]
        nor: [WhereString!]
        not: [WhereString!]
        exists: Boolean
        match: String
        imatch: String
      }
  `,
    ],
  };
}
