import {
  RelationFieldBaseInput,
  RelationFieldBaseInternal,
  RelationFieldBaseMetaInfo,
  IRelationFieldBase,
  RelationFieldBase,
  RelationFieldBasePersistence,
  RelationFieldBaseOutput,
} from './relationfieldbase';
import { merge } from 'lodash';
import { EntityType, Nullable, assignValue } from './types';
import { HasMany } from './hasmany';
import { HasOne } from './hasone';

export interface IEntityField
  extends IRelationFieldBase<
    EntityFieldMeta,
    EntityFieldInput,
    EntityFieldPersistence,
    EntityFieldOutput
  > {
  type: EntityType;
  list: boolean;
  derived: boolean;
}

export interface EntityFieldPersistence extends RelationFieldBasePersistence {}

export interface EntityFieldMeta
  extends RelationFieldBaseMetaInfo<EntityFieldPersistence> {}

export interface EntityFieldInternal
  extends RelationFieldBaseInternal<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  list: boolean;
  derived: boolean;
}

export interface EntityFieldInput
  extends RelationFieldBaseInput<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  list?: boolean;
  derived?: boolean;
}

export interface EntityFieldOutput
  extends RelationFieldBaseOutput<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  list?: boolean;
  derived?: boolean;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class EntityField
  extends RelationFieldBase<
    EntityFieldMeta,
    EntityFieldInput,
    EntityFieldInternal,
    EntityFieldPersistence,
    EntityFieldOutput
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
    return this.$obj.list;
  }

  get derived(): boolean {
    return this.$obj.derived;
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
      setDefault: src => (src.list = false),
    });

    assignValue<EntityFieldInternal, EntityFieldInput, boolean>({
      src: this.$obj,
      input,
      field: 'derived',
      effect: (src, value) => (src.derived = value),
      setDefault: src => (src.derived = false),
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
        src.type = type;
      },
      required: true,
    });
  }

  public toObject(): EntityFieldOutput {
    return merge({}, super.toObject(), {
      type: this.$obj.type,
      list: this.$obj.list,
    } as Partial<EntityFieldOutput>);
  }
}
