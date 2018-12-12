import {
  ModelBaseInternal,
  IModelBase,
  ModelBaseInput,
  ModelMetaInfo,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  FieldArgs,
  OperationKind,
  AsHash,
  MetaModelType,
  assignValue,
  HashToMap,
  NamedArray,
  ArrayToMap,
  MapToArray,
} from './types';
import { merge } from 'lodash';

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
  readonly args?: Map<string, FieldArgs>;
  readonly payload: Map<string, FieldArgs>;
  readonly order: number;
}

export interface OperationMetaInfo extends ModelMetaInfo {
  entity: string;
  order: number;
}

export interface OperationInput extends ModelBaseInput<OperationMetaInfo> {
  args?: AsHash<FieldArgs> | NamedArray<FieldArgs>;
  inheritedFrom?: string;
  payload: AsHash<FieldArgs> | NamedArray<FieldArgs>;
  entity: string;
  actionType: OperationKind;
  order: number;
}

export interface OperationOutput extends ModelBaseOutput<OperationMetaInfo> {
  args?: NamedArray<FieldArgs>;
  inheritedFrom?: string;
  payload: NamedArray<FieldArgs>;
  entity: string;
  actionType: OperationKind;
  order: number;
}

export interface OperationInternal
  extends ModelBaseInternal<OperationMetaInfo> {
  args: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
  inheritedFrom?: string;
  entity: string;
  actionType: OperationKind;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

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
    return this.$obj.actionType;
  }

  get inheritedFrom(): string | undefined {
    return this.$obj.inheritedFrom;
  }

  get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  get order(): number {
    return this.metadata_.order;
  }

  constructor(init: OperationInput) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(input: OperationInput) {
    super.updateWith(input);

    assignValue({
      src: this.$obj,
      input,
      field: 'actionType',
    });

    assignValue<
      OperationInternal,
      OperationInput,
      AsHash<FieldArgs> | NamedArray<FieldArgs>
    >({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      AsHash<FieldArgs> | NamedArray<FieldArgs>
    >({
      src: this.$obj,
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      required: true,
    });
  }

  public toObject(): OperationOutput {
    return merge({}, super.toObject(), {
      actionType: this.actionType,
      inheritedFrom: this.inheritedFrom,
      args: MapToArray(this.args, (name, value) => ({
        ...value,
        name,
      })),
      payload: MapToArray(this.payload, (name, value) => ({
        ...value,
        name,
      })),
    } as Partial<OperationOutput>);
  }
}
