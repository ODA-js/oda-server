import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import { merge, get } from 'lodash';
import {
  EnumType,
  Nullable,
  assignValue,
  MetaModelType,
  Multiplicity,
  EntityType,
} from './types';
import { Internal } from './element';

export interface IInputField
  extends IModelBase<InputFieldMeta, InputFieldInput, InputFieldOutput> {
  readonly type: string | EnumType | EntityType;
  readonly multiplicity?: Multiplicity;
  readonly defaultValue?: string;
  readonly order?: number;
  readonly required?: boolean;
}

export interface InputFieldMeta extends ModelBaseMetaInfo {
  defaultValue?: string;
  entity: string;
  order: number;
  required: boolean;
  type: string | EnumType | EntityType;
  multiplicity?: Multiplicity;
}

export interface InputFieldInternal extends ModelBaseInternal {
  type: string | EnumType | EntityType;
  multiplicity: Multiplicity;
}

export interface InputFieldInput extends ModelBaseInput<InputFieldMeta> {
  type?: string | EnumType | EntityType;
  required?: boolean;
  defaultValue?: string;
  multiplicity?: Multiplicity;
  order?: number;
  entity?: string;
}

export interface InputFieldOutput extends ModelBaseOutput<InputFieldMeta> {
  type?: string | EnumType;
  defaultValue?: string;
  multiplicity?: Multiplicity;
  order?: number;
}

export const inputFieldDefaultMetaInfo = {};
export const inputFieldDefaultInput = { metadata: inputFieldDefaultMetaInfo };

export class InputField
  extends ModelBase<
    InputFieldMeta,
    InputFieldInput,
    InputFieldInternal,
    InputFieldOutput
  >
  implements IInputField {
  public get modelType(): MetaModelType {
    const internal = this[Internal];
    return typeof internal.type === 'string'
      ? 'input-simple-field'
      : internal.type.type === 'entity'
      ? 'input-entity-field'
      : 'input-enum-field';
  }

  get type(): string | EnumType | EntityType {
    return this[Internal].type;
  }

  // if it is the field is List of Items i.e. String[]
  get multiplicity(): Multiplicity {
    return get(this[Internal], 'multiplicity', 'one');
  }

  get defaultValue(): string | undefined {
    return get(this.metadata, 'defaultValue');
  }

  get order(): number {
    return this.metadata.order;
  }

  get required(): boolean {
    return this.metadata.required;
  }

  constructor(init: InputFieldInput) {
    super(merge({}, inputFieldDefaultInput, init));
  }

  public updateWith(input: Nullable<InputFieldInput>) {
    super.updateWith(input);

    assignValue<InputFieldInternal, InputFieldInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = value.trim()),
      required: true,
    });

    assignValue({
      src: this.metadata,
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue<
      InputFieldInternal,
      InputFieldInput,
      NonNullable<InputFieldInput['type']>
    >({
      src: this[Internal],
      input,
      field: 'type',
      effect: (src, value) => {
        if (typeof value !== 'string') {
          if (!value.multiplicity) {
            value.multiplicity = 'one';
          } else {
            src.multiplicity = value.multiplicity;
          }
        }
        src.type = value;
      },
      setDefault: src => (src.type = 'string'),
    });

    assignValue<
      InputFieldInternal,
      InputFieldInput,
      NonNullable<InputFieldInput['multiplicity']>
    >({
      src: this[Internal],
      input,
      field: 'multiplicity',
      required: true,
      effect: (src, value) => {
        if (this.modelType === 'input-enum-field') {
          (src.type as EnumType).multiplicity = value ? 'many' : 'one';
        }
        if (this.modelType === 'input-entity-field') {
          (src.type as EntityType).multiplicity = value ? 'many' : 'one';
        }
        src.multiplicity = value;
      },
      setDefault: src => {
        if (this.modelType === 'input-enum-field') {
          src.multiplicity = (src.type as EnumType).multiplicity || 'one';
        }
        if (this.modelType === 'input-entity-field') {
          src.multiplicity = (src.type as EntityType).multiplicity || 'one';
        } else {
          src.multiplicity = 'one';
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

    assignValue<InputFieldMeta, InputFieldInput, boolean>({
      src: this.metadata,
      input,
      inputField: 'required',
      effect: (src, value) => (src.required = value),
      setDefault: src => (src.required = false),
    });
  }

  public toObject(): InputFieldOutput {
    return merge({}, super.toObject(), {
      defaultValue: this.defaultValue,
      type: this.type,
      multiplicity: this[Internal].multiplicity,
    } as Partial<InputFieldOutput>);
  }

  public mergeWith(payload: Nullable<InputFieldInput>) {
    super.mergeWith(payload);
  }
}
