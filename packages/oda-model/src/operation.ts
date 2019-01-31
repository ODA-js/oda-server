import {
  ModelBaseInternal,
  IModelBase,
  ModelBaseInput,
  ModelBaseMetaInfo,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  OperationKind,
  AsHash,
  MetaModelType,
  assignValue,
  NamedArray,
  ArrayToMap,
  MapToArray,
  Nullable,
  HashToArray,
  EnumType,
  EntityType,
  isEnumType,
  isEntityType,
} from './types';
import { merge } from 'lodash';
import { Internal, MetaData } from './element';
import decapitalize from './lib/decapitalize';
import {
  IRecordField,
  RecordField,
  RecordFieldInput,
  RecordFieldOutput,
} from './recordfield';
import { QueryInput } from './query';
import { MutationInput } from './mutation';
import { IEntity } from './entity';
import { IRelationField } from './relationfield';
import { isISimpleField } from './field';
import {
  isRecord,
  isRecordInput,
  Record,
  IRecord,
  RecordInput,
  RecordOutput,
} from './record';
/**
 * Kind of mutation which is intended to work with single entity
 */
export interface IOperation
  extends IModelBase<OperationMetaInfo, OperationInput, OperationOutput> {
  /**
   * action type
   * CRUD
   */
  readonly actionType: OperationKind;
  /**
   * is it field inherited from other entity and which one
   */
  readonly inheritedFrom?: string;
  /**
   * set of arguments
   */
  readonly args?: Map<string, IRecord | IRecordField>;
  readonly payload:
    | string
    | EnumType
    | EntityType
    | Map<string, IRecord | IRecordField>;
  readonly order: number;
  readonly entity: string;
  readonly field?: string;
}

export interface OperationMetaInfo extends ModelBaseMetaInfo {
  entity: string;
  field?: string;
  order: number;
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface OperationInput extends ModelBaseInput<OperationMetaInfo> {
  args?:
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
  payload?:
    | string
    | EnumType
    | EntityType
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;

  inheritedFrom?: string;
  entity?: string;
  field?: string;
  actionType: OperationKind;
  custom?: boolean;
  order?: number;
}

export interface OperationOutput extends ModelBaseOutput<OperationMetaInfo> {
  args: NamedArray<RecordFieldInput>;
  payload: string | NamedArray<RecordFieldInput>;
  inheritedFrom?: string;
  entity: string;
  field?: string;
  custom: boolean;
  actionType: OperationKind;
  order: number;
}

export interface OperationInternal extends ModelBaseInternal {
  args: Map<string, IRecord | IRecordField>;
  payload: string | EnumType | EntityType | Map<string, IRecord | IRecordField>;
  inheritedFrom?: string;
  /** хранит ссылку на entity */
  entity?: IEntity;
  /** хранит ссылку на поле */
  field?: IRelationField;
  custom: boolean;
  actionType: OperationKind;
}

export const operationDefaultMetaInfo = { acl: { execute: [] } };
export const operationDefaultInput = { metadata: operationDefaultMetaInfo };

export class Operation
  extends ModelBase<
    OperationMetaInfo,
    OperationInput,
    OperationInternal,
    OperationOutput
  >
  implements IOperation {
  public get modelType(): MetaModelType {
    return 'operation';
  }

  public get actionType(): OperationKind {
    return this[Internal].actionType;
  }

  public get custom(): Boolean {
    return this[Internal].custom;
  }

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): Map<string, IRecord | IRecordField> {
    return this[Internal].args;
  }

  get payload():
    | string
    | EnumType
    | EntityType
    | Map<string, IRecord | IRecordField> {
    return this[Internal].payload;
  }

  get order(): number {
    return this.metadata.order;
  }

  get entity(): string {
    return this.metadata.entity;
  }

  get field(): string | undefined {
    return this.metadata.field;
  }

  constructor(init: OperationInput) {
    super(merge({}, operationDefaultInput, init));
  }

  public updateWith(input: Nullable<OperationInput>) {
    super.updateWith(input);

    assignValue<OperationInternal, OperationInput, OperationInput['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value.trim())),
      required: true,
    });

    assignValue<
      OperationMetaInfo,
      OperationInput,
      NonNullable<OperationInput['entity']>
    >({
      src: this[MetaData],
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue<
      OperationMetaInfo,
      OperationInput,
      NonNullable<OperationInput['field']>
    >({
      src: this.metadata,
      input,
      field: 'field',
      effect: (src, value) => (src.field = value),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['custom']>
    >({
      src: this[Internal],
      input,
      field: 'custom',
      effect: (src, value) => (src.custom = value),
      setDefault: src => (src.custom = false),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['actionType']>
    >({
      src: this[Internal],
      input,
      field: 'actionType',
    });

    assignValue<
      OperationMetaInfo,
      OperationInput,
      NonNullable<OperationInput['order']>
    >({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['args']>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          v =>
            isRecordInput(v)
              ? new Record({ ...v, kind: 'input' })
              : new RecordField({ ...v, kind: 'input' }),
          (obj, src) =>
            isRecord(obj) && isRecord(src)
              ? obj.mergeWith(src.toObject())
              : !isRecord(obj) && !isRecord(src)
              ? obj.mergeWith(src.toObject())
              : obj,
        )),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['payload']>
    >({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload =
          typeof value === 'string'
            ? value
            : isEnumType(value) || isEntityType(value)
            ? value
            : ArrayToMap(
                Array.isArray(value) ? value : HashToArray(value),
                v =>
                  isRecordInput(v)
                    ? new Record({ ...v, kind: 'output' })
                    : new RecordField({ ...v, kind: 'output' }),
                (obj, src) =>
                  isRecord(obj) && isRecord(src)
                    ? obj.mergeWith(src.toObject())
                    : !isRecord(obj) && !isRecord(src)
                    ? obj.mergeWith(src.toObject())
                    : obj,
              )),
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): OperationOutput {
    const internal = this[Internal];
    const payload =
      typeof internal.payload === 'string'
        ? internal.payload
        : isEnumType(internal.payload) || isEntityType(internal.payload)
        ? internal.payload
        : MapToArray(internal.payload, (_name, value) => value.toObject());
    return merge({}, super.toObject(), {
      actionType: this.actionType,
      custom: this.custom,
      inheritedFrom: this.inheritedFrom,
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload,
    } as Partial<OperationOutput>);
  }

  public toMutation(_entity: IEntity): MutationInput | undefined {
    if (
      this.actionType === 'create' ||
      this.actionType === 'update' ||
      this.actionType === 'delete' ||
      this.actionType === 'addTo' ||
      this.actionType === 'removeFrom'
    ) {
      const internal = this[Internal];
      let payload =
        typeof internal.payload === 'string'
          ? internal.payload
          : isEnumType(internal.payload) || isEntityType(internal.payload)
          ? internal.payload
          : MapToArray(internal.payload, (_name, value) => value.toObject());

      let name = this.name;
      let args: NamedArray<RecordFieldOutput | RecordOutput> = MapToArray(
        internal.args,
        (_name, value) => value.toObject(),
      );

      if (!this.custom) {
        switch (this.actionType) {
          case 'create':
            name = `create${this.entity}`;
            break;
          case 'update':
            name = `update${this.entity}`;
            break;
          case 'delete':
            name = `delete${this.entity}`;
            break;
          case 'addTo':
            if (this.field) {
              const field = _entity.fields.get(this.field);
              if (field && !isISimpleField(field)) {
                name = `addTo${field.relation.metadata.name.full}`;
                args = [
                  {
                    name: 'input',
                    type: `addTo${field.relation.metadata.name.full}Input`,
                    required: true,
                  } as RecordFieldOutput,
                ];
                payload = `addTo${field.relation.metadata.name.full}Payload`;
              }
            }
            break;
          case 'removeFrom':
            if (this.field) {
              const field = _entity.fields.get(this.field);
              if (field && !isISimpleField(field)) {
                name = `removeFrom${field.relation.metadata.name.full}`;
                args = [
                  {
                    name: 'input',
                    type: `addTo${field.relation.metadata.name.full}Input`,
                    required: true,
                  } as RecordFieldOutput,
                ];
                payload = `addTo${field.relation.metadata.name.full}Payload`;
              }
            }
            break;
        }
      }
      return { ...this.toObject(), name, payload, args };
    } else {
      return;
    }
  }

  public toQuery(_entity: IEntity): QueryInput | undefined {
    if (
      (this.actionType === 'readOne' || this.actionType === 'readMany') &&
      _entity
    ) {
      let name: string = this.name;

      if (!this.custom) {
        switch (this.actionType) {
          case 'readOne':
            name = decapitalize(_entity.name);
            break;
          case 'readMany':
            name = decapitalize(_entity.plural);
            break;
        }
      }

      return {
        ...this.toObject(),
        name,
      };
    } else {
      return;
    }
  }

  public mergeWith(payload: Nullable<OperationInput>) {
    super.mergeWith(payload);
  }
}
