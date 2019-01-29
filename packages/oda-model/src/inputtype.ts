import { ElementMetaInfo, Internal, MetaData } from './element';
import {
  IModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  HashToArray,
  NamedArray,
  MapToArray,
  ArrayToMap,
} from './types';

import { merge } from 'lodash';
import * as inflected from 'inflected';
import { InputFieldInput, InputField, IInputField } from './inputfield';
import { EntityFieldInput } from './entityfield';
import { UIView } from './entitybase';

export interface IInputType
  extends IModelBase<InputTypeMetaInfo, InputTypeInput, InputTypeOutput> {
  readonly plural: string;
  readonly global: boolean;
  readonly titlePlural: string;
  readonly fields: Map<string, IInputField>;
}

export interface InputTypeMetaInfo extends ElementMetaInfo {
  titlePlural: string;
  global: boolean;
  name: {
    plural: string;
    singular: string;
  };
  UI: UIView;
}

export interface InputTypeInternal extends ModelBaseInternal {
  fields: Map<string, IInputField>;
}

export interface InputTypeInput extends ModelBaseInput<InputTypeMetaInfo> {
  plural?: string;
  titlePlural?: string;
  fields?: AsHash<InputFieldInput> | NamedArray<InputFieldInput>;
}

export interface InputTypeOutput extends ModelBaseOutput<InputTypeMetaInfo> {
  fields: NamedArray<InputFieldInput>;
}

export const InputTypeDefaultMetaInfo = {
  name: {},
  UI: {
    listName: [],
    quickSearch: [],
    hidden: [],
    edit: [],
    show: [],
    list: [],
    embedded: [],
  },
};
export const InputTypeDefaultInput = {
  metadata: InputTypeDefaultMetaInfo,
  exact: false,
};

export class InputType
  extends ModelBase<
    InputTypeMetaInfo,
    InputTypeInput,
    InputTypeInternal,
    InputTypeOutput
  >
  implements IInputType {
  public get modelType(): MetaModelType {
    return 'input-type';
  }

  constructor(init: InputTypeInput) {
    super(merge({}, InputTypeDefaultInput, init));
  }

  get plural(): string {
    return this.metadata.name.plural;
  }

  get titlePlural(): string {
    return this.metadata.titlePlural;
  }

  get global(): boolean {
    return this.metadata.global;
  }

  get fields(): Map<string, IInputField> {
    return this[Internal].fields;
  }

  public updateWith(input: Nullable<InputTypeInput>) {
    super.updateWith(input);

    assignValue<InputTypeInternal, InputTypeInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = value.trim();
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<InputTypeMetaInfo, InputTypeInput, boolean>({
      src: this[MetaData],
      input,
      field: 'name',
      effect: (src, value) => (src.global = value),
      setDefault: src => (src.global = false),
    });

    assignValue<InputTypeMetaInfo, InputTypeInput, string>({
      src: this.metadata,
      input,
      field: 'name.plural',
      inputField: 'plural',
      effect: (src, value) => {
        src.name.plural = value.trim();
        if (src.name.plural === this.name) {
          src.name.plural = `All${this.name}`;
        }
      },
      setDefault: src => {
        src.name.plural = inflected.pluralize(this.name);
        if (src.name.plural === this.name) {
          src.name.plural = `All${this.name}`;
        }
      },
    });

    assignValue<InputTypeMetaInfo, InputTypeInput, string>({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<
      InputTypeInternal,
      InputTypeInput,
      AsHash<InputFieldInput> | NamedArray<InputFieldInput>
    >({
      src: this[Internal],
      input,
      field: 'fields',
      effect: (src, value) => {
        const fields = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          (fld, order) => {
            let field = new InputField(
              merge({}, fld, {
                order,
                entity: this.name,
              } as Partial<EntityFieldInput>),
            );
            return field;
          },
          (obj: any, src: any) => obj.mergeWith(src.toObject()),
        );

        src.fields = fields;
      },
      setDefault: src => (src.fields = new Map()),
    });
  }

  public toObject(): InputTypeOutput {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<InputTypeOutput>);
  }

  public mergeWith(payload: Nullable<InputTypeInput>) {
    super.mergeWith(payload);
  }
}
