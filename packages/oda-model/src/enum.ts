import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
} from './modelbase';
import { EnumItem, IEnumItem, EnumItemInput } from './enumItem';
import { merge } from 'lodash';
import { ElementMetaInfo } from './element';
import { MetaModelType, Nullable, assignValue } from './model';

export interface IEnum extends IModelBase<EnumMetaInfo, EnumInput> {
  /**
   * Enum item definition
   */
  items: Map<string, IEnumItem>;
}

export interface EnumMetaInfo extends ElementMetaInfo {}

export interface EnumInternal extends ModelBaseInternal<EnumMetaInfo> {
  items: Map<string, IEnumItem>;
}

export interface EnumInput extends ModelBaseInput<EnumMetaInfo> {
  items: (EnumItemInput | string)[];
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Enum extends ModelBase<EnumMetaInfo, EnumInput, EnumInternal>
  implements IEnum {
  public modelType: MetaModelType = 'union';
  get items() {
    return this.$obj.items;
  }

  constructor(inp: EnumInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: Nullable<EnumInput>) {
    super.updateWith(input);

    assignValue<EnumInternal, EnumInput, EnumInput['items']>({
      src: this.$obj,
      input,
      field: 'items',
      effect: (src, value) =>
        (src.items = new Map(
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
                    title: i.title || i.name,
                    description: i.description || i.title || i.name,
                    value: i.value,
                    metadata: i.metadata,
                  }),
                ] as [string, IEnumItem],
            ),
        )),
      required: true,
    });
  }

  public toObject(): EnumInput {
    return merge({}, super.toObject(), {
      items: [...this.$obj.items.values()].map(i => i.toObject()),
    });
  }
}
