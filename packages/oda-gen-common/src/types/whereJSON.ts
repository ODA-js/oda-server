import { GQLModule } from './empty';

export class WhereJSON extends GQLModule {
  protected _name = 'WhereJSON';
  protected _typeDef = {
    entry: [
      `
      input WhereJSON {
        query: JSON!
      }
  `,
    ],
  };
}
