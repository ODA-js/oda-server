import { GQLModule } from './empty';

export class StateOfFieldType extends GQLModule {
  protected _name = 'StateOfFieldType';
  protected _resolver: { [key: string]: any } = {
    ImageSize: {
      __getValues: () => [
        {
          name: 'assigned',
          value: 'assigned',
          isDeprecated: false,
        },
        {
          name: 'void',
          value: 'void',
          isDeprecated: false,
        },
      ],
    },
  };

  protected _typeDef = {
    entry: [
      `
    # State of field
    enum eSOF {
      assigned
      void
    }
  `,
    ],
  };
}
