import {
  FieldBaseInput,
  FieldBaseInternal,
  FieldBaseMetaInfo,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
} from './fieldbase';
import { merge, get } from 'lodash';
import { EntityType, Nullable, assignValue } from './model';

export interface IEntityField
  extends IFieldBase<
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

export interface EntityFieldPersistence extends FieldBasePersistence {}

export interface EntityFieldMeta
  extends FieldBaseMetaInfo<EntityFieldPersistence> {
  defaultValue?: string;
}

export interface EntityFieldInternal
  extends FieldBaseInternal<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  list: boolean;
}

export interface EntityFieldInput
  extends FieldBaseInput<EntityFieldMeta, EntityFieldPersistence> {
  type: string;
  list?: boolean;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class EntityField
  extends FieldBase<
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

  // if it is the field is List of Items i.e. String[]
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
  }

  public toObject(): EntityFieldInput {
    return merge({}, super.toObject(), {
      type: this.$obj.type,
      list: this.$obj.list,
    });
  }
}
