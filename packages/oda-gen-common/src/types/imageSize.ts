import { GQLModule } from './empty';

export class ImageSizeType extends GQLModule {
  protected _name = 'ImageSizeType';
  protected _resolver: { [key: string]: any } = {
    ImageSize: {
      __getValues: () => [
        {
          name: 'small',
          value: 'small',
          isDeprecated: false,
        },
        {
          name: 'middle',
          value: 'middle',
          isDeprecated: false,
        },
        {
          name: 'large',
          value: 'large',
          isDeprecated: false,
        },
      ],
    },
  };

  protected _typeDef = {
    entry: [
      `
      enum ImageSize {
        small
        middle
        large
      }
    `,
    ],
  };
}
