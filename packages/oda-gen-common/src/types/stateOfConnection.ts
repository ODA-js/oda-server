import { GQLModule } from './empty';

export class StateOfConectionType extends GQLModule {
  protected _name = 'StateOfConectionType';
  protected _resolver: { [key: string]: any } = {
    ImageSize: {
      __getValues: () => [
        {
          name: 'empty',
          value: 'empty',
          isDeprecated: false,
        },
        {
          name: 'any',
          value: 'any',
          isDeprecated: false,
        },
      ],
    },
  };

  protected _typeDef = {
    entry: [
      `
      # State of Connection
      enum eSOC {
        empty
        any
      }
    `,
    ],
  };
}
