import {
  FieldBaseInput,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
  FieldBaseMetaInfo,
  FieldBaseInternal,
  FieldBaseOutput,
} from './fieldbase';
import { merge } from 'lodash';
import { Nullable, MetaModelType } from './types';
import { IRelation } from './relation';

export interface RelationFieldBaseMetaInfo<
  P extends RelationFieldBasePersistence
> extends FieldBaseMetaInfo<P> {}

export interface RelationFieldBasePersistence extends FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
}

export interface RelationFieldBaseInput<
  T extends RelationFieldBaseMetaInfo<P>,
  P extends RelationFieldBasePersistence
> extends FieldBaseInput<T, P> {}

export interface RelationFieldBaseOutput<
  T extends RelationFieldBaseMetaInfo<P>,
  P extends RelationFieldBasePersistence
> extends FieldBaseOutput<T, P> {}

/**
 * relation field definition
 */
export interface IRelationFieldBase<
  T extends RelationFieldBaseMetaInfo<P>,
  I extends FieldBaseInput<T, P>,
  P extends RelationFieldBasePersistence,
  O extends FieldBaseOutput<T, P>
> extends IFieldBase<T, I, P, O> {
  relation: IRelation;
}

export interface RelationFieldBaseInternal<
  T extends RelationFieldBaseMetaInfo<P>,
  P extends RelationFieldBasePersistence
> extends FieldBaseInternal<T, P> {
  relation: IRelation;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

export abstract class RelationFieldBase<
  T extends RelationFieldBaseMetaInfo<P>,
  I extends RelationFieldBaseInput<T, P>,
  S extends RelationFieldBaseInternal<T, P>,
  P extends RelationFieldBasePersistence,
  O extends FieldBaseOutput<T, P>
> extends FieldBase<T, I, S, P, O> implements IRelationFieldBase<T, I, P, O> {
  public get modelType(): MetaModelType {
    return 'relation-base';
  }
  constructor(init: I) {
    super(merge({}, defaultInput, init));
  }

  get relation(): IRelation {
    return this.$obj.relation;
  }

  public updateWith(obj: Nullable<I>) {
    super.updateWith(obj);
  }

  public toObject(): O {
    return merge({}, super.toObject(), {} as Partial<O>);
  }
}
