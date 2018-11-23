import { GQLModule } from './empty';

export class WhereDate extends GQLModule {
  protected _name = 'WhereDate';
  protected _typeDef = {
    entry: [
      `
      input WhereDate {
        eq: Date
        gt: Date
        gte: Date
        lt: Date
        lte: Date
        ne: Date
        in: [Date!]
        nin: [Date!]
        and: [WhereDate!]
        or: [WhereDate!]
        nor: [WhereDate!]
        not: [WhereDate!]
        exists: Boolean
        match: String
      }
  `,
    ],
  };
}
