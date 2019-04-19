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
  MetaModelType,
  assignValue,
  MapToArray,
  Nullable,
  CommonArgs,
  CommonPayload,
  CommonArgsInput,
  CommonPayloadInput,
  CommonArgsOutput,
  CommonPayloadOutput,
} from './types';
import { outputPayload } from './utils/converters';
import { inputArgs, inputPayload } from './utils/converters';
import { merge } from 'lodash';
import { Internal, MetaData } from './element';
import decapitalize from './lib/decapitalize';
import { IEntity } from './entity';
import { IRelationField } from './relationfield';

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
  readonly args: CommonArgs;
  readonly payload: CommonPayload;
  readonly order: number;
  readonly entity: string;
  readonly field?: string;
  readonly custom: boolean;
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
  args?: CommonArgsInput;
  payload?: CommonPayloadInput;
  inheritedFrom?: string;
  entity?: string;
  field?: string;
  actionType: OperationKind;
  custom?: boolean;
  order?: number;
}

export interface OperationOutput extends ModelBaseOutput<OperationMetaInfo> {
  args: CommonArgsOutput;
  payload: CommonPayloadOutput;
  inheritedFrom?: string;
  entity: string;
  /** addTo/removeFrom */
  field?: string;
  custom: boolean;
  actionType: OperationKind;
  order: number;
}

export interface OperationInternal extends ModelBaseInternal {
  args: CommonArgs;
  payload: CommonPayload;
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

  public get custom(): boolean {
    return this[Internal].custom;
  }

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): CommonArgs {
    return this[Internal].args;
  }

  get payload(): CommonPayload {
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
      effect: (src, value) => (src.args = inputArgs(value)),
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
      effect: (src, value) => (src.payload = inputPayload(value)),
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): OperationOutput {
    const internal = this[Internal];
    const payload = outputPayload(internal.payload);
    return merge({}, super.toObject(), {
      actionType: this.actionType,
      custom: this.custom,
      inheritedFrom: this.inheritedFrom,
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload,
    } as Partial<OperationOutput>);
  }

  public mergeWith(payload: Nullable<OperationInput>) {
    super.mergeWith(payload);
  }
}
