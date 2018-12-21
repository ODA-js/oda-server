import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
  ModelBaseOutput,
} from './modelbase';
import { merge } from 'lodash';
import { MetaModelType, Nullable, assignValue } from './types';
import { ElementMetaInfo, Internal } from './element';

export interface IEnumItem
  extends IModelBase<EnumItemMetaInfo, EnumItemInput, EnumItemOutput> {
  readonly value: string;
}

export interface EnumItemMetaInfo extends ElementMetaInfo {}

export interface EnumItemInternal extends ModelBaseInternal {
  value: string;
}

export interface EnumItemInput extends ModelBaseInput<EnumItemMetaInfo> {
  value?: string;
}
export interface EnumItemOutput extends ModelBaseOutput<EnumItemMetaInfo> {
  value: string;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

export class EnumItem
  extends ModelBase<
    EnumItemMetaInfo,
    EnumItemInput,
    EnumItemInternal,
    EnumItemOutput
  >
  implements IEnumItem {
  public get modelType(): MetaModelType {
    return 'enum-item';
  }

  constructor(init: EnumItemInput) {
    super(merge({}, defaultInput, init));
  }

  get value(): string {
    return this[Internal].value;
  }

  updateWith(input: Nullable<EnumItemInput>) {
    super.updateWith(input);
    assignValue<EnumItemInternal, EnumItemInput, EnumItemInput['value']>({
      src: this[Internal],
      input,
      field: 'value',
      setDefault: src => (src.value = src.name),
    });
  }

  toObject(): EnumItemOutput {
    return merge({}, super.toObject(), { value: this.value } as Partial<
      EnumItemOutput
    >);
  }
}
