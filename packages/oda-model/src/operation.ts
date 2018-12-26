import {
  ModelBaseInternal,
  IModelBase,
  ModelBaseInput,
  ModelBaseMetaInfo,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  IFieldArgs,
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
import { Internal } from './element';
import decapitalize from './lib/decapitalize';
import { IArgs, Args } from './args';
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
  readonly args?: Map<string, IArgs>;
  readonly payload: Map<string, IArgs>;
  readonly order: number;
  readonly entity?: string;
}

export interface OperationMetaInfo extends ModelBaseMetaInfo {
  entity: string;
  order: number;
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface OperationInput extends ModelBaseInput<OperationMetaInfo> {
  args: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
  payload: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
  inheritedFrom?: string;
  entity?: string;
  actionType: OperationKind;
  order?: number;
}

export interface OperationOutput extends ModelBaseOutput<OperationMetaInfo> {
  args?: NamedArray<IFieldArgs>;
  inheritedFrom?: string;
  payload: NamedArray<IFieldArgs>;
  entity: string;
  actionType: OperationKind;
  order: number;
}

export interface OperationInternal extends ModelBaseInternal {
  args: Map<string, IArgs>;
  payload: Map<string, IArgs>;
  inheritedFrom?: string;
  entity: string;
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

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): Map<string, IArgs> {
    return this[Internal].args;
  }

  get payload(): Map<string, IArgs> {
    return this[Internal].payload;
  }

  get order(): number {
    return this.metadata.order;
  }

  get entity(): string {
    return this.metadata.entity;
  }

  constructor(init: OperationInput) {
    super(merge({}, operationDefaultInput, init));
  }

  public updateWith(input: OperationInput) {
    super.updateWith(input);

    assignValue<OperationInternal, OperationInput, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value.trim())),
      required: true,
    });

    assignValue({
      src: this.metadata,
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue({
      src: this[Internal],
      input,
      field: 'actionType',
    });

    assignValue({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      AsHash<IFieldArgs> | NamedArray<IFieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value, v => new Args(v))
          : HashToMap(value, (name, v) => new Args({ name, ...v }))),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      AsHash<IFieldArgs> | NamedArray<IFieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) =>
        (src.payload = Array.isArray(value)
          ? ArrayToMap(value, v => new Args(v))
          : HashToMap(value, (name, v) => new Args({ name, ...v }))),
      required: true,
    });
  }

  public toObject(): OperationOutput {
    return merge({}, super.toObject(), {
      actionType: this.actionType,
      inheritedFrom: this.inheritedFrom,
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload: MapToArray(this[Internal].payload, (_name, value) =>
        value.toObject(),
      ),
    } as Partial<OperationOutput>);
  }
}
