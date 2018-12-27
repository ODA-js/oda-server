import {
  ModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  IModelBase,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import { merge } from 'lodash';
import { MetaModelType, Nullable, assignValue } from './types';
import { Internal } from './element';

export interface IEnumItem
  extends IModelBase<EnumItemMetaInfo, EnumItemInput, EnumItemOutput> {
  readonly value: string;
}

export interface EnumItemMetaInfo extends ModelBaseMetaInfo {}

export interface EnumItemInternal extends ModelBaseInternal {
  value: string;
}

export interface EnumItemInput extends ModelBaseInput<EnumItemMetaInfo> {
  value?: string;
}
export interface EnumItemOutput extends ModelBaseOutput<EnumItemMetaInfo> {
  value?: string;
}

export const enumItemDefaultMetaInfo = {};
export const enumItemDefaultInput = { metadata: enumItemDefaultMetaInfo };

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
    super(merge({}, enumItemDefaultInput, init));
  }

  get value(): string {
    return this[Internal].value || this[Internal].name;
  }

  updateWith(input: Nullable<EnumItemInput>) {
    super.updateWith(input);
    assignValue<EnumItemInternal, EnumItemInput, EnumItemInput['value']>({
      src: this[Internal],
      input,
      field: 'value',
    });
  }

  toObject(): EnumItemOutput {
    return merge({}, super.toObject(), {
      value: this[Internal].value,
    } as Partial<EnumItemOutput>);
  }
  mergeWith(payload: Nullable<EnumItemInput>) {
    super.mergeWith(payload);
  }
}
