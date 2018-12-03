import {
  ModelBaseInternal,
  IModelBase,
  ModelBaseInput,
  ModelMetaInfo,
  ModelBase,
} from './modelbase';
import {
  FieldArgs,
  OperationKind,
  AsHash,
  MetaModelType,
  assignValue,
  HashToMap,
  MapToHash,
} from './model';
import { merge } from 'lodash';

export interface IOperation
  extends IModelBase<OperationMetaInfo, OperationInput> {
  /**
   * set of arguments
   */
  args?: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
  /**
   * is it field inherited from other entity and which one
   */
  inheritedFrom?: string;
  /**
   * action type
   * CRUD
   */
  actionType: OperationKind;
}

export interface OperationMetaInfo extends ModelMetaInfo {
  entity: string;
  order?: number;
}

export interface OperationInput extends ModelBaseInput<OperationMetaInfo> {
  args?: AsHash<FieldArgs>;
  inheritedFrom?: string;
  payload: AsHash<FieldArgs>;
  entity: string;
  actionType: OperationKind;
  order?: number;
}

export interface OperationInternal
  extends ModelBaseInternal<OperationMetaInfo> {
  args?: Map<string, FieldArgs>;
  payload: Map<string, FieldArgs>;
  inheritedFrom?: string;
  entity: string;
  actionType: OperationKind;
}

export class Operation
  extends ModelBase<OperationMetaInfo, OperationInput, OperationInternal>
  implements IOperation {
  public modelType: MetaModelType = 'operation';

  public get actionType(): OperationKind {
    return this.$obj.actionType;
  }

  get inheritedFrom(): string | undefined {
    return this.$obj.inheritedFrom;
  }

  get args(): Map<string, FieldArgs> | undefined {
    return this.$obj.args;
  }

  get payload(): Map<string, FieldArgs> {
    return this.$obj.payload;
  }

  get order(): number | undefined {
    return this.metadata_.order;
  }

  public updateWith(input: OperationInput) {
    super.updateWith(input);

    assignValue({
      src: this.$obj,
      input,
      field: 'actionType',
    });

    assignValue<OperationInternal, OperationInput, AsHash<FieldArgs>>({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) => (src.args = HashToMap(value)),
    });

    assignValue<OperationInternal, OperationInput, AsHash<FieldArgs>>({
      src: this.$obj,
      input,
      field: 'payload',
      effect: (src, value) => (src.args = HashToMap(value)),
      required: true,
    });
  }

  public toObject(): OperationInput {
    return merge({}, super.toObject(), {
      actionType: this.actionType,
      inheritedFrom: this.inheritedFrom,
      args: this.args ? MapToHash(this.args) : undefined,
      payload: this.payload ? MapToHash(this.payload) : undefined,
    });
  }
}
