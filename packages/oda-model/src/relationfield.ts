import { merge } from 'lodash';
import { Nullable, assignValue, MetaModelType } from './types';
import { RelationInput } from './relation';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsToMany } from './belongstomany';
import { BelongsTo } from './belongsto';
import {
  RelationFieldBase,
  RelationFieldBaseMetaInfo,
  RelationFieldBasePersistence,
  IRelationFieldBase,
  RelationFieldBaseInternal,
  RelationFieldBaseInput,
  RelationFieldBaseOutput,
} from './relationfieldbase';
import { Internal } from './element';

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

export interface RelationFieldPersistence
  extends RelationFieldBasePersistence {}

export interface RelationFieldInput
  extends RelationFieldBaseInput<
    RelationFieldMetaInfo,
    RelationFieldPersistence
  > {
  relation: RelationInput;
}

export interface RelationFieldOutput
  extends RelationFieldBaseOutput<
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
    RelationFieldPersistence,
    RelationFieldOutput
  > {}

export interface RelationFieldInput
  extends RelationFieldBaseInput<
    RelationFieldMetaInfo,
    RelationFieldPersistence
  > {}

export interface RelationFieldInternal extends RelationFieldBaseInternal {}

const defaultMetaInfo = {};
const defaultInput = {
  metadata: defaultMetaInfo,
  persistent: false,
  derived: false,
  identity: false,
  indexed: false,
  required: false,
};

export class RelationField
  extends RelationFieldBase<
    RelationFieldMetaInfo,
    RelationFieldInput,
    RelationFieldInternal,
    RelationFieldPersistence,
    RelationFieldOutput
  >
  implements IRelationField {
  public get modelType(): MetaModelType {
    return 'relation-field';
  }
  constructor(init: RelationFieldInput) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(input: Nullable<RelationFieldInput>) {
    super.updateWith(input);

    assignValue<
      RelationFieldInternal,
      RelationFieldInput,
      RelationFieldInput['relation']
    >({
      src: this[Internal],
      input,
      field: 'relation',
      effect: (src, value) => {
        switch (discoverFieldType(value)) {
          case 'HasOne':
            src.relation = new HasOne({
              ...(value as { hasOne: string }),
              entity: this.metadata.entity,
              field: this.name,
            });
            break;
          case 'HasMany':
            src.relation = new HasMany({
              ...(value as { hasMany: string }),
              entity: this.metadata.entity,
              field: this.name,
            });
            break;
          case 'BelongsToMany':
            src.relation = new BelongsToMany({
              ...(value as { belongsToMany: string; using: string }),
              entity: this.metadata.entity,
              field: this.name,
            });
            break;
          case 'BelongsTo':
            src.relation = new BelongsTo({
              ...(value as { belongsTo: string }),
              entity: this.metadata.entity,
              field: this.name,
            });
            break;
          default:
            throw new Error('undefined type');
        }
      },
    });

    assignValue<
      RelationFieldMetaInfo,
      RelationFieldInput,
      NonNullable<RelationFieldInput['derived']>
    >({
      src: this.metadata,
      input,
      inputField: 'derived',
      effect: (src, value) => {
        if (
          this.relation.verb === 'HasOne' ||
          this.relation.verb === 'HasMany'
        ) {
          src.persistence.derived = value;
        } else {
          src.persistence.derived = false;
        }
      },
      required: true,
      setDefault: src => (src.persistence.derived = defaultInput.derived),
    });

    assignValue<
      RelationFieldMetaInfo,
      RelationFieldInput,
      NonNullable<RelationFieldInput['persistent']>
    >({
      src: this.metadata,
      input,
      inputField: 'persistent',
      effect: (src, value) => {
        if (this.relation.verb === 'BelongsTo') {
          src.persistence.persistent = value;
        } else {
          src.persistence.persistent = false;
        }
      },
      required: true,
      setDefault: src => (src.persistence.persistent = defaultInput.persistent),
    });

    assignValue<
      RelationFieldMetaInfo,
      RelationFieldInput,
      NonNullable<RelationFieldInput['identity']>
    >({
      src: this.metadata,
      input,
      inputField: 'identity',
      effect: (src, value) => {
        if (this.relation.verb === 'BelongsTo') {
          src.persistence.identity = value;
        } else {
          src.persistence.identity = false;
        }
      },
      required: true,
      setDefault: src => (src.persistence.identity = defaultInput.identity),
    });

    assignValue<
      RelationFieldMetaInfo,
      RelationFieldInput,
      NonNullable<RelationFieldInput['indexed']>
    >({
      src: this.metadata,
      input,
      inputField: 'indexed',
      effect: (src, value) => {
        if (this.relation.verb === 'BelongsTo') {
          src.persistence.indexed = value;
        } else {
          src.persistence.indexed = false;
        }
      },
      required: true,
      setDefault: src => (src.persistence.indexed = defaultInput.indexed),
    });

    assignValue<
      RelationFieldMetaInfo,
      RelationFieldInput,
      NonNullable<RelationFieldInput['required']>
    >({
      src: this.metadata,
      input,
      inputField: 'required',
      effect: (src, value) => {
        if (this.relation.verb === 'BelongsTo') {
          src.persistence.required = value;
        } else {
          src.persistence.required = false;
        }
      },
      required: true,
      setDefault: src => (src.persistence.required = defaultInput.required),
    });
  }

  // it get fixed object
  public toObject(): RelationFieldOutput {
    return merge({}, super.toObject(), {
      relation: this.relation.toObject(),
    } as Partial<RelationFieldOutput>);
  }

  public mergeWith(payload: Nullable<RelationFieldInput>) {
    super.mergeWith(payload);
  }
}
