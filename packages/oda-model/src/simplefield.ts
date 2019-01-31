import {
  FieldBaseInput,
  FieldBaseInternal,
  FieldBaseMetaInfo,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
  FieldBaseOutput,
} from './fieldbase';
import { merge, get } from 'lodash';
import { EnumType, Nullable, assignValue, MetaModelType } from './types';
import { Internal } from './element';
``;
export interface ISimpleField
  extends IFieldBase<
    SimpleFieldMeta,
    SimpleFieldInput,
    SimpleFieldPersistence,
    SimpleFieldOutput
  > {
  readonly type: string | EnumType;
  readonly list?: boolean;
  readonly defaultValue?: string;
}

export interface SimpleFieldPersistence extends FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
}

export interface SimpleFieldMeta
  extends FieldBaseMetaInfo<SimpleFieldPersistence> {
  defaultValue?: string;
}

export interface SimpleFieldInternal extends FieldBaseInternal {
  type: string | EnumType;
  list: boolean;
}

export interface SimpleFieldInput
  extends FieldBaseInput<SimpleFieldMeta, SimpleFieldPersistence> {
  type?: string | EnumType;
  defaultValue?: string;
  list?: boolean;
}

export interface SimpleFieldOutput
  extends FieldBaseOutput<SimpleFieldMeta, SimpleFieldPersistence> {
  type?: string | EnumType;
  defaultValue?: string;
  list?: boolean;
}

export const simpleFieldDefaultMetaInfo = {};
export const simpleFieldDefaultInput = { metadata: simpleFieldDefaultMetaInfo };

export class SimpleField
  extends FieldBase<
    SimpleFieldMeta,
    SimpleFieldInput,
    SimpleFieldInternal,
    SimpleFieldPersistence,
    SimpleFieldOutput
  >
  implements ISimpleField {
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

  constructor(init: SimpleFieldInput) {
    super(merge({}, simpleFieldDefaultInput, init));
  }

  public updateWith(input: Nullable<SimpleFieldInput>) {
    super.updateWith(input);

    assignValue<
      SimpleFieldInternal,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['type']>
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
      SimpleFieldInternal,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['list']>
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

    assignValue<
      SimpleFieldMeta,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['derived']>
    >({
      src: this.metadata,
      input,
      inputField: 'derived',
      effect: (src, value) => {
        src.persistence.derived = value;
        if (!value) {
          this.metadata.persistence.persistent = true;
        }
      },
      setDefault: src => (src.persistence.derived = false),
    });

    assignValue<
      SimpleFieldMeta,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['persistent']>
    >({
      src: this.metadata,
      input,
      inputField: 'persistent',
      effect: (src, value) => (src.persistence.persistent = value),
      setDefault: src => (src.persistence.persistent = true),
    });

    assignValue<
      SimpleFieldMeta,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['args']>
    >({
      src: this.metadata,
      input,
      inputField: 'args',
      allowEffect: (_, value) =>
        Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0,
      effect: (src, _) => (src.persistence.derived = true),
    });

    assignValue<
      SimpleFieldMeta,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['defaultValue']>
    >({
      src: this.metadata,
      input,
      inputField: 'defaultValue',
      effect: (src, value) => {
        src.defaultValue = value;
      },
      allowEffect: (src, _) => !src.persistence.derived,
    });
  }

  public toObject(): SimpleFieldOutput {
    return merge({}, super.toObject(), {
      type: this.type,
      inheritedFrom: this[Internal].inheritedFrom,
      list: this[Internal].list,
    } as Partial<SimpleFieldOutput>);
  }

  public mergeWith(payload: Nullable<SimpleFieldInput>) {
    super.mergeWith(payload);
  }
}
