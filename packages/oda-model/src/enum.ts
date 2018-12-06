import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
} from './modelbase';
import { EnumItem, IEnumItem, EnumItemInput } from './enumItem';
import { merge } from 'lodash';
import { ElementMetaInfo } from './element';
import { MetaModelType, Nullable, assignValue } from './types';

export interface IEnum extends IModelBase<EnumMetaInfo, EnumInput, EnumOutput> {
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

export interface EnumOutput extends ModelBaseOutput<EnumMetaInfo> {
  items: EnumItemInput[];
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Enum
  extends ModelBase<EnumMetaInfo, EnumInput, EnumInternal, EnumOutput>
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

  public toObject(): EnumOutput {
    return merge({}, super.toObject(), {
      items: [...this.$obj.items.values()].map(i => i.toObject()),
    } as Partial<EnumOutput>);
  }
}
