import { ElementMetaInfo, Internal } from './element';
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
import capitalize from './lib/capitalize';
import { InputFieldInput, InputField, IInputField } from './inputfield';
import { EntityFieldInput } from './entityfield';

export interface IEntityBase
  extends IModelBase<EntityBaseMetaInfo, EntityBaseInput, EntityBaseOutput> {
  readonly plural: string;
  readonly titlePlural: string;
  readonly fields: Map<string, IInputField>;
}

export interface UIView {
  listName?: string[];
  quickSearch?: string[];
  hidden?: string[];
  edit?: string[];
  show?: string[];
  list?: string[];
  embedded?: string[];
  enum?: boolean;
  dictionary?: boolean;
}

export interface EntityBaseMetaInfo extends ElementMetaInfo {
  titlePlural: string;
  name: {
    plural: string;
    singular: string;
  };
  UI: UIView;
}

export interface EntityBaseInternal extends ModelBaseInternal {
  fields: Map<string, IInputField>;
}

export interface EntityBaseInput extends ModelBaseInput<EntityBaseMetaInfo> {
  plural?: string;
  titlePlural?: string;
  fields?: AsHash<InputFieldInput> | NamedArray<InputFieldInput>;
}

export interface EntityBaseOutput extends ModelBaseOutput<EntityBaseMetaInfo> {
  plural?: string;
  titlePlural?: string;
  fields: NamedArray<InputFieldInput>;
}

export const entityBaseDefaultMetaInfo = {
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
export const entityBaseDefaultInput = {
  metadata: entityBaseDefaultMetaInfo,
  exact: false,
};

export class EntityBase
  extends ModelBase<
    EntityBaseMetaInfo,
    EntityBaseInput,
    EntityBaseInternal,
    EntityBaseOutput
  >
  implements IEntityBase {
  public get modelType(): MetaModelType {
    return 'entity-base';
  }

  constructor(init: EntityBaseInput) {
    super(merge({}, entityBaseDefaultInput, init));
  }

  get plural(): string {
    return this.metadata.name.plural;
  }

  get titlePlural(): string {
    return this.metadata.titlePlural;
  }

  get fields(): Map<string, IInputField> {
    return this[Internal].fields;
  }

  public updateWith(input: Nullable<EntityBaseInput>) {
    super.updateWith(input);

    assignValue<EntityBaseInternal, EntityBaseInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = capitalize(value.trim());
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<EntityBaseMetaInfo, EntityBaseInput, string>({
      src: this.metadata,
      input,
      field: 'name.plural',
      inputField: 'plural',
      effect: (src, value) => {
        src.name.plural = capitalize(value.trim());
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

    assignValue<EntityBaseMetaInfo, EntityBaseInput, string>({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<
      EntityBaseInternal,
      EntityBaseInput,
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

  public toObject(): EntityBaseOutput {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<EntityBaseOutput>);
  }

  public mergeWith(payload: Nullable<EntityBaseInput>) {
    super.mergeWith(payload);
  }
}
