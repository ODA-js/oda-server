import { GQLModule } from './empty';

export class WhereInt extends GQLModule {
  protected _name = 'WhereInt';
  protected _typeDef = {
    entry: [
      `
      input WhereInt {
        eq: Int
        gt: Int
        gte: Int
        lt: Int
        lte: Int
        ne: Int
        in: [Int!]
        nin: [Int!]
        and: [WhereInt!]
        or: [WhereInt!]
        nor: [WhereInt!]
        not: [WhereInt!]
        exists: Boolean
      }
  `,
    ],
  };
}
