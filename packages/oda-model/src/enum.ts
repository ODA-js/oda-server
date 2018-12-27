import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import { EnumItem, IEnumItem, EnumItemInput } from './enumItem';
import { merge, mergeWith } from 'lodash';
import { Internal } from './element';
import { MetaModelType, Nullable, assignValue, ArrayToMap } from './types';

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

    assignValue<EnumInternal, EnumInput, any>({
      src: this[Internal],
      input,
      field: 'items',
      effect: (src, value) =>
        (src.items = ArrayToMap<any, IEnumItem>(
          value,
          (i: EnumItemInput | string) =>
            new EnumItem(
              typeof i === 'string' ? ({ name: i } as EnumItemInput) : i,
            ),
          (obj, src) => obj.mergeWith(src.toObject()),
        )),
      required: true,
      setDefault: src => (src.items = new Map()),
    });
  }

  public toObject(): EnumOutput {
    return merge({}, super.toObject(), {
      items: [...this[Internal].items.values()].map(i => i.toObject()),
    } as Partial<EnumOutput>);
  }

  public mergeWith(payload: Nullable<EnumInput>) {
    const update = mergeWith(
      this.toObject(),
      payload,
      (
        o: any,
        s: any,
        key: string,
        _obj: any,
        _source: any,
        _stack: string[],
      ) => {
        if (key === 'items') {
          return [...o, ...s];
        }
        if (key == 'name') {
          return o;
        }
        return;
      },
    );
    this.updateWith(update);
  }
}
