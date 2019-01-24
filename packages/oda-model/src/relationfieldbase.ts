import {
  FieldBaseInput,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
  FieldBaseMetaInfo,
  FieldBaseInternal,
  FieldBaseOutput,
  FieldBaseMetaInfoACL,
} from './fieldbase';
import { merge } from 'lodash';
import { Nullable, MetaModelType } from './types';
import { IRelation } from './relation';
import { Internal } from './element';

export interface RelationFieldBaseMetaInfoACL extends FieldBaseMetaInfoACL {
  /** if package allowed to create item of relation */
  create: string[];
  /** if package allowed to delete item of relation */
  delete: string[];
}

export interface RelationFieldBaseMetaInfo<
  P extends RelationFieldBasePersistence
> extends FieldBaseMetaInfo<P> {
  acl: RelationFieldBaseMetaInfoACL;
}

export interface RelationFieldBasePersistence extends FieldBasePersistence {}

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
  readonly relation: IRelation;
}

export interface RelationFieldBaseInternal extends FieldBaseInternal {
  relation: IRelation;
}

const defaultMetaInfo = {
  acl: {
    read: [],
    update: [],
    create: [],
    delete: [],
  },
};
const defaultInput = { metadata: defaultMetaInfo };

export class RelationFieldBase<
  T extends RelationFieldBaseMetaInfo<P>,
  I extends RelationFieldBaseInput<T, P>,
  S extends RelationFieldBaseInternal,
  P extends RelationFieldBasePersistence,
  O extends FieldBaseOutput<T, P>
> extends FieldBase<T, I, S, P, O> implements IRelationFieldBase<T, I, P, O> {
  public get modelType(): MetaModelType {
    return 'relation-base';
  }

  get relation(): IRelation {
    return this[Internal].relation;
  }

  constructor(init: I) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(obj: Nullable<I>) {
    super.updateWith(obj);
  }

  public toObject(): O {
    return merge({}, super.toObject(), {} as Partial<O>);
  }
  public mergeWith(payload: Nullable<I>) {
    super.mergeWith(payload);
  }
}
