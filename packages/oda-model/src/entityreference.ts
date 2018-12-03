import * as inflected from 'inflected';
import decapitalize from './lib/decapitalize';
import { merge } from 'lodash';

import { DEFAULT_ID_FIELDNAME, REF_PATTERN } from './definitions';
import { MetaModelType, Nullable, assignValue } from './model';
import {
  ElementMetaInfo,
  ElementInternal,
  Element,
  ElementInput,
} from './element';

function StrToEntityRef(input: string): EntityRefInput {
  let res = input.match(REF_PATTERN);
  return {
    backField: decapitalize(res ? res[1] : ''),
    entity: inflected.classify(res ? res[2] : ''),
    field: decapitalize(res ? res[3].trim() : ''),
  };
}

export interface IEntityRef {
  /**
   * referencing entity
   */
  entity: string;
  /**
   * referencing key field
   */
  field: string;
  /**
   * the backed field
   * field that in owner of the reference is storing the key
   */
  backField?: string;
}

export interface EntityRefMetaInfo extends ElementMetaInfo {}

export interface EntityRefInternal extends ElementInternal<EntityRefMetaInfo> {
  entity: string;
  field?: string;
  backField?: string;
}

export interface EntityRefInput extends ElementInput<EntityRefMetaInfo> {
  entity: string;
  field?: string;
  backField?: string;
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

/** Entity reference implementation */
export class EntityReference
  extends Element<EntityRefMetaInfo, EntityRefInput, EntityRefInternal>
  implements IEntityRef {
  public modelType: MetaModelType = 'ref';
  /** the Entity that is referenced */
  public get entity(): string {
    return this.$obj.entity;
  }

  public set entity(value: string) {
    this.$obj.entity = value;
  }
  /** the Identity field */
  public get field(): string {
    return this.$obj.field ? this.$obj.field : DEFAULT_ID_FIELDNAME;
  }

  public set field(value: string) {
    this.$obj.field = value;
  }

  /** the Identity field */
  public get backField(): string {
    return this.$obj.backField || '';
  }

  public set backField(value: string) {
    this.$obj.backField = value;
  }

  constructor(init: EntityRefInput | string) {
    super(merge({}, defaultInput, typeof init === 'object' ? init : {}));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
    this.updateWith(typeof init === 'object' ? init : StrToEntityRef(init));
  }

  public toObject() {
    return merge({}, super.toObject(), {
      backField: this.$obj.backField,
      entity: this.$obj.entity,
      field: this.$obj.field,
    });
  }

  public updateWith(input: Nullable<EntityRefInput>) {
    super.updateWith(input);

    assignValue<EntityRefInternal, EntityRefInput, EntityRefInput['entity']>({
      src: this.$obj,
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
      required: true,
    });

    assignValue<EntityRefInternal, EntityRefInput, EntityRefInput['field']>({
      src: this.$obj,
      input,
      field: 'field',
    });

    assignValue<EntityRefInternal, EntityRefInput, EntityRefInput['backField']>(
      { src: this.$obj, input, field: 'backField' },
    );
  }

  public toString(): string {
    return `${this.backField ? this.backField + '@' : ''}${this.$obj.entity}#${
      this.$obj.field
    }`;
  }
}