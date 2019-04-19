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
  ArgumentKind,
} from './types';

import { merge } from 'lodash';
import * as inflected from 'inflected';
import {
  ObjectTypeFieldInput,
  ObjectTypeField,
  IObjectTypeField,
} from './objecttypefield';
import { UIView } from './entitybase';

export interface IObjectType
  extends IModelBase<ObjectTypeMetaInfo, ObjectTypeInput, ObjectTypeOutput> {
  readonly kind: ArgumentKind;
  readonly plural: string;
  readonly global: boolean;
  readonly titlePlural: string;
  readonly fields: Map<string, IObjectTypeField>;
}

export interface ObjectTypeMetaInfo extends ElementMetaInfo {
  titlePlural: string;
  global: boolean;
  name: {
    plural: string;
    singular: string;
  };
  UI: UIView;
}

export interface ObjectTypeInternal extends ModelBaseInternal {
  fields: Map<string, IObjectTypeField>;
  kind: ArgumentKind;
}

export interface ObjectTypeInput extends ModelBaseInput<ObjectTypeMetaInfo> {
  kind?: ArgumentKind;
  plural?: string;
  global?: boolean;
  titlePlural?: string;
  fields: AsHash<ObjectTypeFieldInput> | NamedArray<ObjectTypeFieldInput>;
}

export function isObjectTypeInput(inp: any): inp is ObjectTypeInput {
  return typeof inp === 'object' && inp.hasOwnProperty('fields');
}

export function isObjectType(inp: any): inp is IObjectType | ObjectType {
  return (
    typeof inp === 'object' &&
    (inp.modelType as MetaModelType) === 'object-type'
  );
}

export interface ObjectTypeOutput extends ModelBaseOutput<ObjectTypeMetaInfo> {
  fields: NamedArray<ObjectTypeFieldInput>;
  kind: ArgumentKind;
}

export const recordDefaultMetaInfo = {
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
export const recordDefaultInput = {
  metadata: recordDefaultMetaInfo,
  exact: false,
};

export class ObjectType
  extends ModelBase<
    ObjectTypeMetaInfo,
    ObjectTypeInput,
    ObjectTypeInternal,
    ObjectTypeOutput
  >
  implements IObjectType {
  public get modelType(): MetaModelType {
    return 'object-type';
  }

  constructor(init: ObjectTypeInput) {
    super(merge({}, recordDefaultInput, init));
  }

  get kind(): ArgumentKind {
    return this[Internal].kind;
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

  get fields(): Map<string, IObjectTypeField> {
    return this[Internal].fields;
  }

  public updateWith(input: Nullable<ObjectTypeInput>) {
    super.updateWith(input);

    assignValue<ObjectTypeInternal, ObjectTypeInput, ObjectTypeInput['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = value.trim();
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<
      ObjectTypeMetaInfo,
      ObjectTypeInput,
      NonNullable<ObjectTypeInput['global']>
    >({
      src: this[MetaData],
      input,
      field: 'global',
      effect: (src, value) => (src.global = value),
      setDefault: src => (src.global = false),
    });

    assignValue<
      ObjectTypeMetaInfo,
      ObjectTypeInput,
      NonNullable<ObjectTypeInput['plural']>
    >({
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

    assignValue<
      ObjectTypeMetaInfo,
      ObjectTypeInput,
      NonNullable<ObjectTypeInput['titlePlural']>
    >({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<
      ObjectTypeInternal,
      ObjectTypeInput,
      NonNullable<ObjectTypeInput['kind']>
    >({
      src: this[Internal],
      input,
      field: 'kind',
      effect: (src, value) => (src.kind = value),
      setDefault: src => (src.kind = 'input'),
    });

    assignValue<
      ObjectTypeInternal,
      ObjectTypeInput,
      NonNullable<ObjectTypeInput['fields']>
    >({
      src: this[Internal],
      input,
      field: 'fields',
      effect: (src, value) => {
        const fields = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          (fld, order) => {
            let field = new ObjectTypeField(
              merge({}, fld, {
                order,
                entity: this.name,
                kind: this.kind,
              }),
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

  public toObject(): ObjectTypeOutput {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      kind: this[Internal].kind,
    } as Partial<ObjectTypeOutput>);
  }

  public mergeWith(payload: Nullable<ObjectTypeInput>) {
    super.mergeWith(payload);
  }
}
