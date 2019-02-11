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
import {
  EntityType,
  Nullable,
  assignValue,
  MetaModelType,
  Multiplicity,
} from './types';
import { HasMany } from './hasmany';
import { HasOne } from './hasone';
import { Internal, MetaData } from './element';

export interface IEntityField
  extends IRelationFieldBase<
    EntityFieldMeta,
    EntityFieldInput,
    EntityFieldPersistence,
    EntityFieldOutput
  > {
  readonly type: EntityType;
  readonly multiplicity: Multiplicity;
}

export interface EntityFieldPersistence extends RelationFieldBasePersistence {}

export interface EntityFieldMeta
  extends RelationFieldBaseMetaInfo<EntityFieldPersistence> {}

export interface EntityFieldInternal extends RelationFieldBaseInternal {
  type: EntityType;
  multiplicity: Multiplicity;
}

export interface EntityFieldInput
  extends RelationFieldBaseInput<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  multiplicity?: Multiplicity;
}

export interface EntityFieldOutput
  extends RelationFieldBaseOutput<EntityFieldMeta, EntityFieldPersistence> {
  type: EntityType;
  multiplicity?: Multiplicity;
}

const defaultMetaInfo = {
  persistence: {
    derived: false,
    persistent: true,
    identity: false,
    indexed: false,
  },
};
const defaultInput = { metadata: defaultMetaInfo };

export class EntityField
  extends RelationFieldBase<
    EntityFieldMeta,
    EntityFieldInput,
    EntityFieldInternal,
    EntityFieldPersistence,
    EntityFieldOutput
  >
  implements IEntityField {
  public get modelType(): MetaModelType {
    return 'entity-field';
  }
  constructor(init: EntityFieldInput) {
    super(merge({}, defaultInput, init));
  }
  get type(): EntityType {
    return this[Internal].type;
  }

  get multiplicity(): Multiplicity {
    return this[Internal].multiplicity;
  }

  get derived(): boolean {
    return this[MetaData].persistence.derived;
  }

  public updateWith(input: Nullable<EntityFieldInput>) {
    super.updateWith(input);

    assignValue<
      EntityFieldInternal,
      EntityFieldInput,
      NonNullable<EntityFieldInput['multiplicity']>
    >({
      src: this[Internal],
      input,
      field: 'multiplicity',
      effect: (src, value) => {
        if (src.type) {
          src.type.multiplicity = value ? 'many' : 'one';
        } else {
          if (input.type) {
            input.type.multiplicity = value ? 'many' : 'one';
          }
        }
        src.multiplicity = value;
      },
      required: true,
      setDefault: src => {
        src.multiplicity = src.type ? src.type.multiplicity || 'one' : 'one';
      },
    });

    assignValue<
      EntityFieldInternal,
      EntityFieldInput,
      NonNullable<EntityFieldInput['type']>
    >({
      src: this[Internal],
      input,
      field: 'type',
      effect: (src, type) => {
        if (!type.multiplicity) {
          type.multiplicity = 'one';
        }
        switch (type.multiplicity) {
          case 'one': {
            src.relation = new HasOne({
              hasOne: `${type.name}#`,
              entity: this.metadata.entity,
              field: this.name,
              embedded: true,
            });
            src.multiplicity = 'one';
            break;
          }
          case 'many': {
            src.relation = new HasMany({
              hasMany: `${type.name}#`,
              entity: this.metadata.entity,
              field: this.name,
              embedded: true,
            });
            src.multiplicity = 'many';
            break;
          }
          default:
        }
        src.type = type;
      },
      required: true,
    });

    assignValue<
      EntityFieldMeta,
      EntityFieldInput,
      NonNullable<EntityFieldInput['identity']>
    >({
      src: this[MetaData],
      input,
      field: 'identity',
      allowEffect: () => false,
      required: true,
      setDefault: src => (src.persistence.identity = false),
    });

    assignValue<
      EntityFieldMeta,
      EntityFieldInput,
      NonNullable<EntityFieldInput['derived']>
    >({
      src: this[MetaData],
      input,
      field: 'derived',
      effect: (src, value) => (src.persistence.derived = value),
      required: true,
      setDefault: src => (src.persistence.derived = false),
    });

    assignValue<
      EntityFieldMeta,
      EntityFieldInput,
      NonNullable<EntityFieldInput['persistent']>
    >({
      src: this[MetaData],
      input,
      field: 'persistent',
      effect: (src, value) => (src.persistence.persistent = value),
      required: true,
      setDefault: src => (src.persistence.persistent = false),
    });
  }

  public toObject(): EntityFieldOutput {
    return merge({}, super.toObject(), {
      type: this[Internal].type,
      multiplicity: this[Internal].multiplicity,
    } as Partial<EntityFieldOutput>);
  }

  public mergeWith(payload: Nullable<EntityFieldInput>) {
    super.mergeWith(payload);
  }
}
