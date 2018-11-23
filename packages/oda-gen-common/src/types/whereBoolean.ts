import { GQLModule } from './empty';

export class WhereBoolean extends GQLModule {
  protected _name = 'WhereBoolean';
  protected _typeDef = {
    entry: [
      `
      input WhereBoolean {
        eq: Boolean
        ne: Boolean
        exists: Boolean
      }
  `,
    ],
  };
}
