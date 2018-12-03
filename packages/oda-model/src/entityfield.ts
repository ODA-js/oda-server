import {
  RelationFieldBaseInput,
  RelationFieldBaseInternal,
  RelationFieldBaseMetaInfo,
  IRelationFieldBase,
  RelationFieldBase,
  RelationFieldBasePersistence,
} from './relationfieldbase';
import { merge, get } from 'lodash';
import { EntityType, Nullable, assignValue } from './model';
import { HasMany } from './hasmany';
import { HasOne } from './hasone';

export interface IEntityField
  extends IRelationFieldBase<
    EntityFieldMeta,
    EntityFieldInput,
    EntityFieldPersistence
  > {
  /**
   * field type
   */
  type: EntityType;
  list?: boolean;
}

export interface EntityFieldPersistence extends RelationFieldBasePersistence {}

export interface EntityFieldMeta
  extends RelationFieldBaseMetaInfo<EntityFieldPersistence> {}

export interface EntityFieldInternal
  extends RelationFieldBaseInternal<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  list: boolean;
}

export interface EntityFieldInput
  extends RelationFieldBaseInput<EntityFieldMeta, EntityFieldPersistence> {
  type: string;
  list?: boolean;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class EntityField
  extends RelationFieldBase<
    EntityFieldMeta,
    EntityFieldInput,
    EntityFieldInternal,
    EntityFieldPersistence
  >
  implements IEntityField {
  constructor(init: EntityFieldInput) {
    super(merge({}, defaultInput, init));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }
  get type(): EntityType {
    return this.$obj.type;
  }

  get list(): boolean {
    return get(this.$obj, 'list', false);
  }

  public updateWith(input: Nullable<EntityFieldInput>) {
    super.updateWith(input);

    assignValue({
      src: this.$obj,
      input,
      field: 'type',
    });

    assignValue<EntityFieldInternal, EntityFieldInput, boolean>({
      src: this.$obj,
      input,
      field: 'list',
      effect: (src, value) => (src.list = value),
      required: true,
      setDefault: src => (src.list = false),
    });

    assignValue<EntityFieldInternal, EntityFieldInput, EntityType>({
      src: this.$obj,
      input,
      field: 'type',
      effect: (src, type) => {
        switch (type.multiplicity) {
          case 'one': {
            src.relation = new HasOne({
              hasOne: `${type.name}#`,
              entity: this.metadata_.entity,
              field: this.name,
              embedded: true,
            });
            break;
          }
          case 'many': {
            src.relation = new HasMany({
              hasMany: `${type.name}#`,
              entity: this.metadata_.entity,
              field: this.name,
              embedded: true,
            });
            break;
          }
          default:
        }
      },
      required: true,
    });
  }

  public toObject(): EntityFieldInput {
    return merge({}, super.toObject(), {
      type: this.$obj.type,
      list: this.$obj.list,
    });
  }
}
