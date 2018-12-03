import {
  FieldBaseInput,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
  FieldBaseMetaInfo,
  FieldBaseInternal,
} from './fieldbase';
import { IEntityRef } from './entityreference';
import { merge } from 'lodash';
import { Nullable } from './model';
import { IRelation, RelationInput } from './relation';

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

/**
 * relation field definition
 */
export interface IRelationFieldBase<
  T extends RelationFieldBaseMetaInfo<P>,
  I extends FieldBaseInput<T, P>,
  P extends RelationFieldBasePersistence
> extends IFieldBase<T, I, P> {
  relation: IRelation;
}

export interface RelationFieldBaseInternal<
  T extends RelationFieldBaseMetaInfo<P>,
  P extends RelationFieldBasePersistence
> extends FieldBaseInternal<T, P> {
  relation: IRelation;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export abstract class RelationFieldBase<
  T extends RelationFieldBaseMetaInfo<P>,
  I extends RelationFieldBaseInput<T, P>,
  S extends RelationFieldBaseInternal<T, P>,
  P extends RelationFieldBasePersistence
> extends FieldBase<T, I, S, P> implements IRelationFieldBase<T, I, P> {
  constructor(inp: I) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  get relation(): IRelation {
    return this.$obj.relation;
  }

  set relation(value: IRelation) {
    this.$obj.relation = value;
  }

  public updateWith(obj: Nullable<I>) {
    super.updateWith(obj);
  }

  // it get fixed object
  public toObject(): any {
    return merge({}, super.toObject(), {
      relation: this.relation.toObject(),
    });
  }
}
