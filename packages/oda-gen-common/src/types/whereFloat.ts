import { GQLModule } from './empty';

export class WhereFloat extends GQLModule {
  protected _name = 'WhereFloat';
  protected _typeDef = {
    entry: [
      `
      input WhereFloat {
        eq: Float
        gt: Float
        gte: Float
        lt: Float
        lte: Float
        ne: Float
        in: [Float!]
        nin: [Float!]
        and: [WhereFloat!]
        or: [WhereFloat!]
        nor: [WhereFloat!]
        not: [WhereFloat!]
        exists: Boolean
      }
  `,
    ],
  };
}
