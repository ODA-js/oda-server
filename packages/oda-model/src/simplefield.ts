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
import {
  EnumType,
  Nullable,
  assignValue,
  MetaModelType,
  Multiplicity,
  ScalarTypeExtension,
  ScalarTypeNames,
  ScalarType,
  isScalarTypeNames,
  isEnumType,
} from './types';
import { Internal } from './element';
``;
export interface ISimpleField
  extends IFieldBase<
    SimpleFieldMeta,
    SimpleFieldInput,
    SimpleFieldPersistence,
    SimpleFieldOutput
  > {
  readonly type: ScalarType | ScalarTypeExtension | EnumType;
  readonly multiplicity?: Multiplicity;
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
  type: ScalarType | ScalarTypeExtension | EnumType;
  multiplicity: Multiplicity;
}

export interface SimpleFieldInput
  extends FieldBaseInput<SimpleFieldMeta, SimpleFieldPersistence> {
  type?: ScalarTypeNames | ScalarType | ScalarTypeExtension | EnumType;
  defaultValue?: string;
  multiplicity?: Multiplicity;
}

export interface SimpleFieldOutput
  extends FieldBaseOutput<SimpleFieldMeta, SimpleFieldPersistence> {
  type?: ScalarType | ScalarTypeExtension | EnumType;
  defaultValue?: string;
  multiplicity?: Multiplicity;
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
    return isEnumType(this[Internal].type) ? 'enum-field' : 'simple-field';
  }

  get type(): ScalarType | ScalarTypeExtension | EnumType {
    return this[Internal].type;
  }

  // if it is the field is List of Items i.e. String[]
  get multiplicity(): Multiplicity {
    return get(this[Internal], 'multiplicity', 'one');
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
        src.type = isScalarTypeNames(value)
          ? { name: value, type: 'scalar' }
          : value;
      },
      setDefault: src => (src.type = { name: 'String', type: 'scalar' }),
    });

    assignValue<
      SimpleFieldInternal,
      SimpleFieldInput,
      NonNullable<SimpleFieldInput['multiplicity']>
    >({
      src: this[Internal],
      input,
      field: 'multiplicity',
      required: true,
      effect: (src, value) => {
        if (this.modelType === 'enum-field') {
          (src.type as EnumType).multiplicity = value ? 'many' : 'one';
        }
        src.multiplicity = value;
      },
      setDefault: src => {
        if (this.modelType === 'enum-field') {
          src.multiplicity = (src.type as EnumType).multiplicity || 'one';
        } else {
          src.multiplicity = 'one';
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
      multiplicity: this[Internal].multiplicity,
    } as Partial<SimpleFieldOutput>);
  }

  public mergeWith(payload: Nullable<SimpleFieldInput>) {
    super.mergeWith(payload);
  }
}
