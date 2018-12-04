import {
  FieldBaseInput,
  FieldBaseInternal,
  FieldBaseMetaInfo,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
} from './fieldbase';
import { IEntityRef } from './entityreference';
import { merge, get, set } from 'lodash';
import { EnumType, Nullable, assignValue, AsHash, FieldArgs } from './model';

export interface ISimpleField
  extends IFieldBase<
    SimpleFieldMeta,
    SimpleFieldInput,
    SimpleFieldPersistence
  > {
  type: string | EnumType;
  defaultValue?: string;
  list?: boolean;
}

export interface SimpleFieldPersistence extends FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
}

export interface SimpleFieldMeta
  extends FieldBaseMetaInfo<SimpleFieldPersistence> {
  defaultValue?: string;
}

export interface SimpleFieldInternal
  extends FieldBaseInternal<SimpleFieldMeta, SimpleFieldPersistence> {
  type: string | EnumType;
  list: boolean;
}

export interface SimpleFieldInput
  extends FieldBaseInput<SimpleFieldMeta, SimpleFieldPersistence> {
  type?: string | EnumType;
  defaultValue?: string;
  list?: boolean;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class SimpleField
  extends FieldBase<
    SimpleFieldMeta,
    SimpleFieldInput,
    SimpleFieldInternal,
    SimpleFieldPersistence
  >
  implements ISimpleField {
  get type(): string | EnumType {
    return this.$obj.type;
  }

  // if it is the field is List of Items i.e. String[]
  get list(): boolean {
    return get(this.$obj, 'list', false);
  }

  get defaultValue(): string | undefined {
    return get(this.metadata_, 'defaultValue');
  }

  constructor(inp: SimpleFieldInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: Nullable<SimpleFieldInput>) {
    super.updateWith(input);

    assignValue({
      src: this.$obj,
      input,
      field: 'type',
    });

    assignValue({
      src: this.$obj,
      input,
      field: 'list',
      setDefault: src => (src.list = false),
      required: true,
    });

    assignValue<SimpleFieldMeta, SimpleFieldInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'derived',
      effect: (src, value) => {
        set(src, 'persistence.derived', value);
        if (!value) {
          set(this.metadata_, 'persistence.persistent', true);
        }
      },
      setDefault: src => set(src, 'persistence.derived', false),
    });

    assignValue<SimpleFieldMeta, SimpleFieldInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'persistent',
      effect: (src, value) => set(src, 'persistence.persistent', value),
      setDefault: src => set(src, 'persistence.persistent', true),
    });

    assignValue<SimpleFieldMeta, SimpleFieldInput, AsHash<FieldArgs>>({
      src: this.metadata_,
      input,
      inputField: 'args',
      allowEffect: (_, value) => value && Object.keys(value).length > 0,
      effect: (src, _) => set(src, 'persistence.derived', true),
    });

    if (input.args && Object.keys(input.args).length > 0) {
      set(this.metadata_, 'persistence.derived', true);
    }

    assignValue({
      src: this.metadata_,
      input,
      inputField: 'defaultValue',
      allowEffect: (src, _) => get(src, 'persistence.derived', false),
    });
  }

  public toObject(): SimpleFieldInput {
    return merge({}, super.toObject(), {
      derived: this.derived,
      defaultValue: this.defaultValue,
      persistent: this.persistent,
      entity: this.metadata_.entity,
      type: this.type,
      inheritedFrom: this.$obj.inheritedFrom,
      list: this.$obj.list,
    } as Partial<SimpleFieldInput>);
  }
}
