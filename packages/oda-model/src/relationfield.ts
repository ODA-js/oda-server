import { IEntityRef } from './entityreference';
import { merge } from 'lodash';
import { Nullable, assignValue } from './model';
import { RelationInput, IRelation } from './relation';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsToMany } from './belongstmany';
import { BelongsTo } from './belongsto';
import {
  RelationFieldBase,
  RelationFieldBaseMetaInfo,
  RelationFieldBasePersistence,
  IRelationFieldBase,
  RelationFieldBaseInternal,
  RelationFieldBaseInput,
} from './relationbasefield';

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

export interface RelationFieldMetaInfo
  extends RelationFieldBaseMetaInfo<RelationFieldPersistence> {}

export interface RelationFieldPersistence extends RelationFieldBasePersistence {
  derived: boolean;
  persistent: boolean;
}

export interface RelationFieldInput
  extends RelationFieldBaseInput<
    RelationFieldMetaInfo,
    RelationFieldPersistence
  > {
  relation: RelationInput;
}

/**
 * relation field definition
 */
export interface IRelationField
  extends IRelationFieldBase<
    RelationFieldMetaInfo,
    RelationFieldInput,
    RelationFieldPersistence
  > {}

export interface RelationFieldInput
  extends RelationFieldBaseInput<
    RelationFieldMetaInfo,
    RelationFieldPersistence
  > {}

export interface RelationFieldInternal
  extends RelationFieldBaseInternal<
    RelationFieldMetaInfo,
    RelationFieldPersistence
  > {}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class RelationField
  extends RelationFieldBase<
    RelationFieldMetaInfo,
    RelationFieldInput,
    RelationFieldInternal,
    RelationFieldPersistence
  >
  implements IRelationField {
  constructor(inp: RelationFieldInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: Nullable<RelationFieldInput>) {
    super.updateWith(input);
    assignValue<RelationFieldInternal, RelationFieldInput, RelationInput>({
      src: this.$obj,
      input,
      field: 'relation',
      effect: (src, value) => {
        switch (discoverFieldType(value)) {
          case 'HasOne':
            src.relation = new HasOne({
              ...(value as { hasOne: string }),
              entity: this.metadata_.entity,
              field: this.name,
            });
            break;
          case 'HasMany':
            src.relation = new HasMany({
              ...(value as { hasMany: string }),
              entity: this.metadata_.entity,
              field: this.name,
            });
            break;
          case 'BelongsToMany':
            src.relation = new BelongsToMany({
              ...(value as { belongsToMany: string; using: string }),
              entity: this.metadata_.entity,
              field: this.name,
            });
            break;
          case 'BelongsTo':
            src.relation = new BelongsTo({
              ...(value as { belongsTo: string }),
              entity: this.metadata_.entity,
              field: this.name,
            });
            break;
          default:
            throw new Error('undefined type');
        }
      },
    });
  }

  // it get fixed object
  public toObject(): any {
    return merge({}, super.toObject(), {
      relation: this.relation.toObject(),
    });
  }
}
