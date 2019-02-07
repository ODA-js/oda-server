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
  ArgumentKind,
} from './types';
import { Internal } from './element';
import {
  IObjectType,
  ObjectTypeInput,
  ObjectTypeOutput,
  isObjectType,
  isObjectTypeInput,
  ObjectType,
} from './objecttype';

export interface IObjectTypeField
  extends IModelBase<
    ObjectTypeFieldMeta,
    ObjectTypeFieldInput,
    ObjectTypeFieldOutput
  > {
  readonly type: string | EnumType | EntityType | IObjectType;
  readonly multiplicity?: Multiplicity;
  readonly defaultValue?: string;
  readonly order?: number;
  readonly required: boolean;
  readonly kind: ArgumentKind;
}

export interface ObjectTypeFieldMeta extends ModelBaseMetaInfo {
  defaultValue?: string;
  order: number;
  required: boolean;
  multiplicity?: Multiplicity;
}

export interface ObjectTypeFieldInternal extends ModelBaseInternal {
  type: string | EnumType | EntityType | IObjectType;
  multiplicity: Multiplicity;
  kind: ArgumentKind;
}

export interface ObjectTypeFieldInput
  extends ModelBaseInput<ObjectTypeFieldMeta> {
  type?: string | EnumType | EntityType | ObjectTypeInput;
  required?: boolean;
  defaultValue?: string;
  multiplicity?: Multiplicity;
  order?: number;
  kind?: ArgumentKind;
}

export interface ObjectTypeFieldOutput
  extends ModelBaseOutput<ObjectTypeFieldMeta> {
  type?: string | EnumType | EntityType | ObjectTypeOutput;
  multiplicity?: Multiplicity;
  order?: number;
  kind: ArgumentKind;
}

export const typeFieldDefaultMetaInfo = {};
export const TypeFieldDefaultInput = { metadata: typeFieldDefaultMetaInfo };

export class ObjectTypeField
  extends ModelBase<
    ObjectTypeFieldMeta,
    ObjectTypeFieldInput,
    ObjectTypeFieldInternal,
    ObjectTypeFieldOutput
  >
  implements IObjectTypeField {
  public get modelType(): MetaModelType {
    const internal = this[Internal];
    return typeof internal.type === 'string'
      ? 'argument-simple-field'
      : isObjectType(internal.type)
      ? 'argument-object-type'
      : internal.type.type === 'entity'
      ? 'argument-entity-field'
      : 'argument-enum-field';
  }

  get type(): string | EnumType | EntityType | IObjectType {
    return this[Internal].type;
  }

  // if it is the field is List of Items i.e. String[]
  get multiplicity(): Multiplicity {
    return get(this[Internal], 'multiplicity', 'one');
  }

  get defaultValue(): string | undefined {
    return get(this.metadata, 'defaultValue');
  }

  get kind(): ArgumentKind {
    return this[Internal].kind;
  }

  get order(): number {
    return this.metadata.order;
  }

  get required(): boolean {
    return this.metadata.required;
  }

  constructor(init: ObjectTypeFieldInput) {
    super(merge({}, TypeFieldDefaultInput, init));
  }

  public updateWith(input: Nullable<ObjectTypeFieldInput>) {
    super.updateWith(input);

    assignValue<
      ObjectTypeFieldInternal,
      ObjectTypeFieldInput,
      ObjectTypeFieldInput['name']
    >({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = value.trim()),
      required: true,
    });

    assignValue<
      ObjectTypeFieldInternal,
      ObjectTypeFieldInput,
      NonNullable<ObjectTypeFieldInput['type']>
    >({
      src: this[Internal],
      input,
      field: 'type',
      effect: (src, value) => {
        if (typeof value !== 'string' && !isObjectTypeInput(value)) {
          if (!value.multiplicity) {
            value.multiplicity = 'one';
          } else {
            src.multiplicity = value.multiplicity;
          }
        }
        if (isObjectTypeInput(value)) {
          src.type = new ObjectType(value);
        } else {
          src.type = value;
        }
      },
      setDefault: src => (src.type = 'string'),
    });

    assignValue<
      ObjectTypeFieldInternal,
      ObjectTypeFieldInput,
      NonNullable<ObjectTypeFieldInput['multiplicity']>
    >({
      src: this[Internal],
      input,
      field: 'multiplicity',
      required: true,
      effect: (src, value) => {
        if (this.modelType === 'argument-enum-field') {
          (src.type as EnumType).multiplicity = value ? 'many' : 'one';
        }
        if (this.modelType === 'argument-entity-field') {
          (src.type as EntityType).multiplicity = value ? 'many' : 'one';
        }
        src.multiplicity = value;
      },
      setDefault: src => {
        if (this.modelType === 'argument-enum-field') {
          src.multiplicity = (src.type as EnumType).multiplicity || 'one';
        }
        if (this.modelType === 'argument-entity-field') {
          src.multiplicity = (src.type as EntityType).multiplicity || 'one';
        } else {
          src.multiplicity = 'one';
        }
      },
    });

    assignValue<
      ObjectTypeFieldMeta,
      ObjectTypeFieldInput,
      NonNullable<ObjectTypeFieldInput['defaultValue']>
    >({
      src: this.metadata,
      input,
      field: 'defaultValue',
      effect: (src, value) => {
        src.defaultValue = value;
      },
    });

    assignValue<
      ObjectTypeFieldMeta,
      ObjectTypeFieldInput,
      NonNullable<ObjectTypeFieldInput['order']>
    >({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue<
      ObjectTypeFieldInternal,
      ObjectTypeFieldInput,
      NonNullable<ObjectTypeFieldInput['kind']>
    >({
      src: this[Internal],
      input,
      field: 'kind',
      effect: (src, value) => (src.kind = value),
      setDefault: src => (src.kind = 'input'),
    });

    assignValue<
      ObjectTypeFieldMeta,
      ObjectTypeFieldInput,
      NonNullable<ObjectTypeFieldInput['required']>
    >({
      src: this.metadata,
      input,
      field: 'required',
      effect: (src, value) => (src.required = value),
      required: true,
      setDefault: src => (src.required = false),
    });
  }

  public toObject(): ObjectTypeFieldOutput {
    return merge({}, super.toObject(), {
      type: isObjectType(this.type) ? this.type.toObject() : this.type,
      multiplicity: this[Internal].multiplicity,
    } as Partial<ObjectTypeFieldOutput>);
  }

  public mergeWith(payload: Nullable<ObjectTypeFieldInput>) {
    super.mergeWith(payload);
  }
}
