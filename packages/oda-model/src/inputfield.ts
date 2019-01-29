import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import { merge, get } from 'lodash';
import { EnumType, Nullable, assignValue, MetaModelType } from './types';
import { Internal } from './element';

export interface IInputField
  extends IModelBase<InputFieldMeta, InputFieldInput, InputFieldOutput> {
  readonly type: string | EnumType;
  readonly list?: boolean;
  readonly defaultValue?: string;
  readonly order: number;
}

export interface InputFieldMeta extends ModelBaseMetaInfo {
  defaultValue?: string;
  order: number;
}

export interface InputFieldInternal extends ModelBaseInternal {
  type: string | EnumType;
  list: boolean;
}

export interface InputFieldInput extends ModelBaseInput<InputFieldMeta> {
  type?: string | EnumType;
  defaultValue?: string;
  list?: boolean;
  order?: number;
}

export interface InputFieldOutput extends ModelBaseOutput<InputFieldMeta> {
  type?: string | EnumType;
  defaultValue?: string;
  list?: boolean;
  order?: number;
}

export const simpleFieldDefaultMetaInfo = {};
export const simpleFieldDefaultInput = { metadata: simpleFieldDefaultMetaInfo };

export class InputField
  extends ModelBase<
    InputFieldMeta,
    InputFieldInput,
    InputFieldInternal,
    InputFieldOutput
  >
  implements IInputField {
  public get modelType(): MetaModelType {
    return typeof this[Internal].type === 'string'
      ? 'simple-field'
      : 'enum-field';
  }

  get type(): string | EnumType {
    return this[Internal].type;
  }

  // if it is the field is List of Items i.e. String[]
  get list(): boolean {
    return get(this[Internal], 'list', false);
  }

  get defaultValue(): string | undefined {
    return get(this.metadata, 'defaultValue');
  }

  get order(): number {
    return this.metadata.order;
  }

  constructor(init: InputFieldInput) {
    super(merge({}, simpleFieldDefaultInput, init));
  }

  public updateWith(input: Nullable<InputFieldInput>) {
    super.updateWith(input);

    assignValue<
      InputFieldInternal,
      InputFieldInput,
      NonNullable<InputFieldInput['type']>
    >({
      src: this[Internal],
      input,
      field: 'type',
      effect: (src, value) => {
        if (typeof value !== 'string' && !value.multiplicity) {
          value.multiplicity = 'one';
        }
        src.type = value;
      },
      setDefault: src => (src.type = 'string'),
    });

    assignValue<
      InputFieldInternal,
      InputFieldInput,
      NonNullable<InputFieldInput['list']>
    >({
      src: this[Internal],
      input,
      field: 'list',
      required: true,
      effect: (src, value) => {
        if (this.modelType === 'enum-field') {
          (src.type as EnumType).multiplicity = value ? 'many' : 'one';
        }
        src.list = value;
      },
      setDefault: src => {
        if (this.modelType === 'enum-field') {
          src.list =
            (src.type as EnumType).multiplicity === 'many' ? true : false;
        } else {
          src.list = false;
        }
      },
    });

    assignValue({
      src: this.metadata,
      input,
      inputField: 'defaultValue',
      effect: (src, value) => {
        src.defaultValue = value;
      },
    });

    assignValue({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });
  }

  public toObject(): InputFieldOutput {
    return merge({}, super.toObject(), {
      defaultValue: this.defaultValue,
      type: this.type,
      list: this[Internal].list,
    } as Partial<InputFieldOutput>);
  }

  public mergeWith(payload: Nullable<InputFieldInput>) {
    super.mergeWith(payload);
  }
}
