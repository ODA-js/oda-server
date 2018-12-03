import {
  FieldBaseInput,
  FieldBaseInternal,
  FieldBaseMetaInfo,
  IFieldBase,
  FieldBase,
  FieldBasePersistence,
} from './fieldbase';
import { EntityReference, IEntityRef } from './entityreference';
import { merge, get, set } from 'lodash';
import { EnumType, Nullable, assignValue, AsHash, FieldArgs } from './model';

export interface ISimpleField
  extends IFieldBase<
    SimpleFieldMeta,
    SimpleFieldInput,
    SimpleFieldPersistence
  > {
  /**
   * is field indexed
   */
  indexed: boolean | string | string[];
  /**
   * if field is used like identity/unique key
   */
  identity: boolean | string | string[];
  /**
   * field type
   */
  type: string | EnumType;
  defaultValue?: string;
  required?: boolean;
  list?: boolean;
}

export interface SimpleFieldPersistence extends FieldBasePersistence {
  derived: boolean;
  persistent: boolean;
  indexed: boolean;
  required: boolean;
  identity: boolean;
}

export interface SimpleFieldMeta
  extends FieldBaseMetaInfo<SimpleFieldPersistence> {
  defaultValue?: string;
}

export interface SimpleFieldInternal
  extends FieldBaseInternal<SimpleFieldMeta, SimpleFieldPersistence> {
  type: string | EnumType;
  list: boolean;
  idKey: IEntityRef;
}

export interface SimpleFieldInput
  extends FieldBaseInput<SimpleFieldMeta, SimpleFieldPersistence> {
  type?: string | EnumType;
  required?: boolean;
  identity?: boolean | string | string[];
  indexed?: boolean | string | string[];
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

  get identity(): boolean | string | string[] {
    return get(this.metadata_, 'persistence.identity', false);
  }

  get required(): boolean {
    return get(this.metadata_, 'persistence.required', false);
  }

  get indexed(): boolean | string | string[] {
    return get(this.metadata_, 'persistence.indexed', false);
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

    assignValue<SimpleFieldMeta, SimpleFieldInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'identity',
      effect: (_, value) => {
        set(this.metadata_, 'storage.identity', value);
        if (value) {
          set(this.metadata_, 'storage.required', true);
          set(this.metadata_, 'storage.indexed', true);
          this.$obj.idKey = new EntityReference({
            entity: this.metadata_.entity,
            field: this.$obj.name,
          });
        }
      },
    });

    assignValue<SimpleFieldMeta, SimpleFieldInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'required',
      effect: (src, value) => set(src, 'storage.required', value),
    });

    assignValue<SimpleFieldMeta, SimpleFieldInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'required',
      effect: (src, value) => set(src, 'storage.required', value),
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
      idKey: this.$obj.idKey ? this.$obj.idKey.toString() : undefined,
    });
  }
}
