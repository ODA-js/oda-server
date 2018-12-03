import {
  IRelation,
  RelationBaseInput,
  RelationBasePersistence,
  RelationBaseMetaInfo,
} from './relationbase';
import {
  FieldBaseInput,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
  FieldBaseMetaInfo,
  FieldBaseInternal,
} from './fieldbase';
import { SimpleFieldInput } from './simplefield';
import { IEntityRef } from './entityreference';
import { merge } from 'lodash';
import { Nullable } from './model';

function discoverFieldType(obj: any) {
  // сделать проверку по полю...
  if (obj.hasOne) {
    return 'HasOne';
  } else if (obj.hasMany) {
    return 'HasMany';
  } else if (obj.belongsTo) {
    return 'BelongsTo';
  } else if (obj.belongsToMany) {
    return 'BelongsToMany';
  } else {
    console.warn(`undefined relation type of ${JSON.stringify(obj)}`);
    return 'undefined';
  }
}

export interface RelationFieldMetaInfo<P extends RelationFieldPersistence>
  extends FieldBaseMetaInfo<P> {}

export interface RelationFieldPersistence extends FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
}

export interface RelationFieldInput<
  T extends RelationFieldMetaInfo<P>,
  P extends RelationFieldPersistence,
  RT extends RelationBaseMetaInfo<RP>,
  RP extends RelationBasePersistence
> extends FieldBaseInput<T, P> {
  relation: RelationBaseInput<RT, RP>;
}

/**
 * relation field definition
 */
export interface IRelationField<
  T extends RelationFieldMetaInfo<P>,
  I extends FieldBaseInput<T, P>,
  RT extends RelationBaseMetaInfo<RP>,
  RI extends RelationBaseInput<RT, RP>,
  P extends RelationFieldPersistence,
  RP extends RelationBasePersistence
> extends IFieldBase<T, I, P> {
  relation: IRelation<RT, RI, RP>;
}

export interface RelationFieldBaseInput<
  T extends RelationFieldMetaInfo<P>,
  P extends RelationFieldPersistence
> extends FieldBaseInput<T, P> {}

export interface RelationFieldInternal<
  T extends RelationFieldMetaInfo<P>,
  P extends RelationFieldPersistence,
  RT extends RelationBaseMetaInfo<RP>,
  RI extends RelationBaseInput<RT, RP>,
  RP extends RelationBasePersistence
> extends FieldBaseInternal<T, P> {
  idKey: IEntityRef;
  relation: IRelation<RT, RI, RP>;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class RelationField<
  T extends RelationFieldMetaInfo<P>,
  I extends RelationFieldInput<T, P, RT, RP>,
  S extends RelationFieldInternal<T, P, RT, RI, RP>,
  P extends RelationFieldPersistence,
  RT extends RelationBaseMetaInfo<RP>,
  RI extends RelationBaseInput<RT, RP>,
  RP extends RelationBasePersistence
> extends FieldBase<T, I, S, P> implements IRelationField<T, I, RT, RI, P, RP> {
  constructor(inp: I) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  get relation(): IRelation<RT, RI, RP> {
    return this.$obj.relation;
  }

  set relation(value: IRelation<RT, RI, RP>) {
    this.$obj.relation = value;
  }

  public updateWith(obj: Nullable<I>) {
    super.updateWith(obj);
    const result = { ...this.$obj };

    if (obj.relation) {
      let $relation = obj.relation;
      let relation: IRelation<RT, RI, RP>;

      switch (discoverFieldType($relation)) {
        case 'HasOne':
          relation = new HasOne({
            ...($relation as { hasOne: string }),
            entity: obj.entity,
            field: obj.name,
          });
          break;
        case 'HasMany':
          relation = new HasMany({
            ...($relation as { hasMany: string }),
            entity: obj.entity,
            field: obj.name,
          });
          break;
        case 'BelongsToMany':
          relation = new BelongsToMany({
            ...($relation as { belongsToMany: string; using: string }),
            entity: obj.entity,
            field: obj.name,
          });
          break;
        case 'BelongsTo':
          relation = new BelongsTo({
            ...($relation as { belongsTo: string }),
            entity: obj.entity,
            field: obj.name,
          });
          break;
        default:
          throw new Error('undefined type');
      }
      result.relation = relation;
    }
  }

  // it get fixed object
  public toObject(): any {
    return merge({}, super.toObject(), {
      relation: this.relation.toObject(),
    });
  }
}
