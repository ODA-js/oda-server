import { GQLModule } from './empty';

export class MutationKindType extends GQLModule {
  protected _name = 'MutationKindType';
  protected _resolver: { [key: string]: any } = {
    ImageSize: {
      __getValues: () => [
        {
          name: 'CREATED',
          value: 'CREATED',
          isDeprecated: false,
        },
        {
          name: 'UPDATED',
          value: 'UPDATED',
          isDeprecated: false,
        },
        {
          name: 'DELETED',
          value: 'DELETED',
          isDeprecated: false,
        },
        {
          name: 'LINK',
          value: 'LINK',
          isDeprecated: false,
        },
        {
          name: 'UNLINK',
          value: 'UNLINK',
          isDeprecated: false,
        },
      ],
    },
  };

  protected _typeDef = {
    entry: [
      `
      # Mutation type
      enum MutationKind {
        CREATE
        UPDATE
        DELETE
        LINK
        UNLINK
      }
    `,
    ],
  };
}
