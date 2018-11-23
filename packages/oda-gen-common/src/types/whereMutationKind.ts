import { GQLModule } from './empty';

export class WhereMutationKind extends GQLModule {
  protected _name = 'WhereMutationKind';
  protected _typeDef = {
    entry: [
      `
      input WhereMutationKind {
        in: [MutationKind!]
      }
  `,
    ],
  };
}
