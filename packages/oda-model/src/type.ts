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
import { TypeFieldInput, TypeField, ITypeField } from './typefield';
import { EntityFieldInput } from './entityfield';
import { UIView } from './entitybase';

export interface IType extends IModelBase<TypeMetaInfo, TypeInput, TypeOutput> {
  readonly plural: string;
  readonly global: boolean;
  readonly titlePlural: string;
  readonly fields: Map<string, ITypeField>;
}

export interface TypeMetaInfo extends ElementMetaInfo {
  titlePlural: string;
  global: boolean;
  name: {
    plural: string;
    singular: string;
  };
  UI: UIView;
}

export interface TypeInternal extends ModelBaseInternal {
  fields: Map<string, ITypeField>;
}

export interface TypeInput extends ModelBaseInput<TypeMetaInfo> {
  plural?: string;
  titlePlural?: string;
  fields?: AsHash<TypeFieldInput> | NamedArray<TypeFieldInput>;
}

export interface TypeOutput extends ModelBaseOutput<TypeMetaInfo> {
  fields: NamedArray<TypeFieldInput>;
}

export const TypeDefaultMetaInfo = {
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
export const typeDefaultInput = {
  metadata: TypeDefaultMetaInfo,
  exact: false,
};

export class Type
  extends ModelBase<TypeMetaInfo, TypeInput, TypeInternal, TypeOutput>
  implements IType {
  public get modelType(): MetaModelType {
    return 'input-type';
  }

  constructor(init: TypeInput) {
    super(merge({}, typeDefaultInput, init));
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

  get fields(): Map<string, ITypeField> {
    return this[Internal].fields;
  }

  public updateWith(input: Nullable<TypeInput>) {
    super.updateWith(input);

    assignValue<TypeInternal, TypeInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = value.trim();
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<TypeMetaInfo, TypeInput, boolean>({
      src: this[MetaData],
      input,
      field: 'name',
      effect: (src, value) => (src.global = value),
      setDefault: src => (src.global = false),
    });

    assignValue<TypeMetaInfo, TypeInput, string>({
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

    assignValue<TypeMetaInfo, TypeInput, string>({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<
      TypeInternal,
      TypeInput,
      AsHash<TypeFieldInput> | NamedArray<TypeFieldInput>
    >({
      src: this[Internal],
      input,
      field: 'fields',
      effect: (src, value) => {
        const fields = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          (fld, order) => {
            let field = new TypeField(
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

  public toObject(): TypeOutput {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<TypeOutput>);
  }

  public mergeWith(payload: Nullable<TypeInput>) {
    super.mergeWith(payload);
  }
}
