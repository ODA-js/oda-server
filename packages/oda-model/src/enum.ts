import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import { EnumItem, IEnumItem, EnumItemInput } from './enumItem';
import { merge } from 'lodash';
import { Internal } from './element';
import { MetaModelType, Nullable, assignValue } from './types';

export interface IEnum extends IModelBase<EnumMetaInfo, EnumInput, EnumOutput> {
  /**
   * Enum item definition
   */
  readonly items: Map<string, IEnumItem>;
}

export interface EnumMetaInfo extends ModelBaseMetaInfo {}

export interface EnumInternal extends ModelBaseInternal {
  items: Map<string, IEnumItem>;
}

export interface EnumInput extends ModelBaseInput<EnumMetaInfo> {
  items: (EnumItemInput | string)[];
}

export interface EnumOutput extends ModelBaseOutput<EnumMetaInfo> {
  items: EnumItemInput[];
}

const enumDefaultMetaInfo = {};
const enumDefaultInput = { metadata: enumDefaultMetaInfo };

export class Enum
  extends ModelBase<EnumMetaInfo, EnumInput, EnumInternal, EnumOutput>
  implements IEnum {
  public get modelType(): MetaModelType {
    return 'enum';
  }
  get items() {
    return this[Internal].items;
  }

  constructor(init: EnumInput) {
    super(merge({}, enumDefaultInput, init));
  }

  public updateWith(input: Nullable<EnumInput>) {
    super.updateWith(input);

    assignValue<EnumInternal, EnumInput, EnumInput['items']>({
      src: this[Internal],
      input,
      field: 'items',
      effect: (src, value) => {
        src.items = new Map();
        value
          .map(i =>
            typeof i === 'string' ? ({ name: i } as EnumItemInput) : i,
          )
          .map(
            i =>
              [
                i.name,
                new EnumItem({
                  name: i.name,
                  title: i.title,
                  description: i.description,
                  value: i.value,
                  metadata: i.metadata,
                }),
              ] as [string, IEnumItem],
          )
          .forEach(item => {
            const dupe = src.items.get(item[0]);
            if (dupe) {
              dupe.mergeWith(item[1]);
            } else {
              src.items.set(item[0], item[1]);
            }
          });
      },
      required: true,
    });
  }

  public toObject(): EnumOutput {
    return merge({}, super.toObject(), {
      items: [...this[Internal].items.values()].map(i => i.toObject()),
    } as Partial<EnumOutput>);
  }
}
