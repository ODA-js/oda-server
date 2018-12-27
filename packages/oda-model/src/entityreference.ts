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
  Internal,
} from './element';

function StrToEntityRef(input: string): Partial<EntityRefInput> {
  let res = input.match(REF_PATTERN);
  return {
    backField: res && res[1] ? decapitalize(res[1]) : undefined,
    entity: res && res[2] ? inflected.classify(res[2]) : undefined,
    field: res && res[3] ? decapitalize(res[3].trim()) : DEFAULT_ID_FIELDNAME,
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

export interface EntityRefInternal extends ElementInternal {
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

export const entityReferenceDefaultMetaInfo = {};
export const entityReferenceDefaultInput = {
  metadata: entityReferenceDefaultMetaInfo,
  entity: 'FAKE',
};

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
    return this[Internal].entity;
  }
  /** the Identity field */
  public get field(): string {
    return this[Internal].field;
  }

  /** the Identity field */
  public get backField(): string {
    return this[Internal].backField || '';
  }

  constructor(init: EntityRefInput | string) {
    super(
      merge(
        {},
        entityReferenceDefaultInput,
        typeof init === 'object' ? init : StrToEntityRef(init),
      ),
    );
  }

  public toString(): string {
    return `${this.backField ? this.backField + '@' : ''}${
      this[Internal].entity
    }#${this[Internal].field}`;
  }

  public updateWith(input: Nullable<EntityRefInput>) {
    super.updateWith(typeof input === 'object' ? input : StrToEntityRef(input));

    assignValue<EntityRefInternal, EntityRefInput, EntityRefInput['entity']>({
      src: this[Internal],
      input,
      field: 'entity',
      required: true,
      setDefault: src => (src.entity = entityReferenceDefaultInput.entity),
    });

    assignValue<EntityRefInternal, EntityRefInput, EntityRefInput['field']>({
      src: this[Internal],
      input,
      field: 'field',
      required: true,
      setDefault: src => (src.field = 'id'),
    });

    assignValue<EntityRefInternal, EntityRefInput, EntityRefInput['backField']>(
      { src: this[Internal], input, field: 'backField' },
    );
  }

  public toObject(): EntityRefOutput {
    return merge({}, super.toObject(), {
      backField: this[Internal].backField,
      entity: this[Internal].entity,
      field: this[Internal].field,
    } as Partial<EntityRefOutput>) as EntityRefOutput;
  }

  public mergeWith(payload: Nullable<EntityRefInput>) {
    super.mergeWith(payload);
  }
}
