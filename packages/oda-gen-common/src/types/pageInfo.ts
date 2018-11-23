import { GQLModule } from './empty';

export class PageInfoType extends GQLModule {
  protected _name = 'PageInfoType';
  protected _typeDef = {
    entry: [
      `
    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
      endCursor: String
      count: Int
    }
  `,
    ],
  };
}
