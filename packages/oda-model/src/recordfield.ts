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

export interface IRecordField
  extends IModelBase<RecordFieldMeta, RecordFieldInput, RecordFieldOutput> {
  readonly type: string | EnumType | EntityType;
  readonly multiplicity?: Multiplicity;
  readonly defaultValue?: string;
  readonly order?: number;
  readonly required: boolean;
  readonly kind: ArgumentKind;
}

export interface RecordFieldMeta extends ModelBaseMetaInfo {
  defaultValue?: string;
  order: number;
  required: boolean;
  type: string | EnumType | EntityType;
  multiplicity?: Multiplicity;
}

export interface RecordFieldInternal extends ModelBaseInternal {
  type: string | EnumType | EntityType;
  multiplicity: Multiplicity;
  kind: ArgumentKind;
}

export interface RecordFieldInput extends ModelBaseInput<RecordFieldMeta> {
  type?: string | EnumType | EntityType;
  required?: boolean;
  defaultValue?: string;
  multiplicity?: Multiplicity;
  order?: number;
  kind?: ArgumentKind;
}

export interface RecordFieldOutput extends ModelBaseOutput<RecordFieldMeta> {
  type?: string | EnumType;
  defaultValue?: string;
  multiplicity?: Multiplicity;
  order?: number;
  kind: ArgumentKind;
  /** stored in metadata so it is not in output */
  required?: boolean;
}

export const typeFieldDefaultMetaInfo = {};
export const TypeFieldDefaultInput = { metadata: typeFieldDefaultMetaInfo };

export class RecordField
  extends ModelBase<
    RecordFieldMeta,
    RecordFieldInput,
    RecordFieldInternal,
    RecordFieldOutput
  >
  implements IRecordField {
  public get modelType(): MetaModelType {
    const internal = this[Internal];
    return typeof internal.type === 'string'
      ? 'argument-simple-field'
      : internal.type.type === 'entity'
      ? 'argument-entity-field'
      : 'argument-enum-field';
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

  get kind(): ArgumentKind {
    return this[Internal].kind;
  }

  get order(): number {
    return this.metadata.order;
  }

  get required(): boolean {
    return this.metadata.required;
  }

  constructor(init: RecordFieldInput) {
    super(merge({}, TypeFieldDefaultInput, init));
  }

  public updateWith(input: Nullable<RecordFieldInput>) {
    super.updateWith(input);

    assignValue<RecordFieldInternal, RecordFieldInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = value.trim()),
      required: true,
    });

    assignValue<
      RecordFieldInternal,
      RecordFieldInput,
      NonNullable<RecordFieldInput['type']>
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
      RecordFieldInternal,
      RecordFieldInput,
      NonNullable<RecordFieldInput['multiplicity']>
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

    assignValue({
      src: this.metadata,
      input,
      field: 'defaultValue',
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

    assignValue({
      src: this[Internal],
      input,
      field: 'kind',
      effect: (src, value) => (src.kind = value),
      setDefault: src => (src.kind = 'input'),
    });

    assignValue<RecordFieldMeta, RecordFieldInput, boolean>({
      src: this.metadata,
      input,
      field: 'required',
      effect: (src, value) => (src.required = value),
      required: true,
      setDefault: src => (src.required = false),
    });
  }

  public toObject(): RecordFieldOutput {
    return merge({}, super.toObject(), {
      defaultValue: this.defaultValue,
      type: this.type,
      multiplicity: this[Internal].multiplicity,
    } as Partial<RecordFieldOutput>);
  }

  public mergeWith(payload: Nullable<RecordFieldInput>) {
    super.mergeWith(payload);
  }
}
