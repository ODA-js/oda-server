import * as inflected from 'inflected';
import decapitalize from './lib/decapitalize';
import { merge } from 'lodash';

import { DEFAULT_ID_FIELDNAME, REF_PATTERN } from './definitions';
import { MetaModelType, Nullable, assignValue } from './types';
import {
  ElementMetaInfo,
  ElementInternal,
  Element,
  ElementInput,
  ElementOutput,
  IUpdatable,
} from './element';

function StrToEntityRef(input: string): EntityRefInput {
  let res = input.match(REF_PATTERN);
  return {
    backField: decapitalize(res && res[1] ? res[1] : ''),
    entity: inflected.classify(res && res[2] ? res[2] : ''),
    field: decapitalize(res && res[3] ? res[3].trim() : DEFAULT_ID_FIELDNAME),
  };
}

export interface IEntityRef
  extends IUpdatable<EntityRefMetaInfo, EntityRefInput, EntityRefOutput> {
  /**
   * referencing entity
   */
  readonly entity: string;
  /**
   * referencing key field
   */
  readonly field: string;
  /**
   * the backed field
   * field that in owner of the reference is storing the key
   */
  readonly backField?: string;
}

export interface EntityRefMetaInfo extends ElementMetaInfo {}

export interface EntityRefInternal extends ElementInternal<EntityRefMetaInfo> {
  entity: string;
  field: string;
  backField?: string;
}

export interface EntityRefInput extends ElementInput<EntityRefMetaInfo> {
  entity: string;
  field?: string;
  backField?: string;
}

export interface EntityRefOutput extends ElementOutput<EntityRefMetaInfo> {
  entity: string;
  backField?: string;
  field: string;
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

/** Entity reference implementation */
export class EntityReference
  extends Element<
    EntityRefMetaInfo,
    EntityRefInput,
    EntityRefInternal,
    EntityRefOutput
  >
  implements IEntityRef {
  public get modelType(): MetaModelType {
    return 'ref';
  }
  /** the Entity that is referenced */
  public get entity(): string {
    return this.$obj.entity;
  }
  /** the Identity field */
  public get field(): string {
    return this.$obj.field;
  }

  /** the Identity field */
  public get backField(): string {
    return this.$obj.backField || '';
  }

  constructor(init: EntityRefInput | string) {
    super(
      merge(
        {},
        defaultInput,
        typeof init === 'object' ? init : StrToEntityRef(init),
      ),
    );
  }

  public toString(): string {
    return `${this.backField ? this.backField + '@' : ''}${this.$obj.entity}#${
      this.$obj.field
    }`;
  }

  public updateWith(input: Nullable<EntityRefInput>) {
    super.updateWith(typeof input === 'object' ? input : StrToEntityRef(input));

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

  public toObject(): EntityRefOutput {
    return merge({}, super.toObject(), {
      backField: this.$obj.backField,
      entity: this.$obj.entity,
      field: this.$obj.field,
    } as Partial<EntityRefOutput>) as EntityRefOutput;
  }
}
