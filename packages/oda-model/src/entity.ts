import {
  EntityBasePersistence,
  EntityBaseInternal,
  EntityBaseMetaInfo,
  EntityBaseInput,
  IEntityBase,
  EntityBase,
  EntityBaseOutput,
} from './entitybase';
import {
  MetaModelType,
  Nullable,
  assignValue,
  isBelongsToMany,
  NamedArray,
  MapToArray,
} from './types';
import { merge } from 'lodash';
import { Internal } from './element';
import { ObjectTypeFieldInput } from './objecttypefield';
import { isISimpleField, isIEntityField } from './field';
import {
  idField,
  mutableFields,
  storedRelations,
  ArgsFromTuples,
  getUniqueIndexedFields,
} from './utils/queries';
import capitalize from './lib/capitalize';
import { payloadToObject } from './payloadToObject';
import { ObjectTypeInput, ObjectType, IObjectType } from './objecttype';
import decapitalize from './lib/decapitalize';
import { IOperation, OperationInput } from './operation';
import { IQuery, QueryInput } from './query';
import { MutationInput } from './mutation';

export interface IEntity
  extends IEntityBase<
    EntityMetaInfo,
    EntityPersistence,
    EntityInput,
    EntityOutput
  > {
  readonly implements: Set<string>;
  readonly embedded: boolean | Set<string>;
  readonly abstract: boolean;
}

export interface EntityInternal extends EntityBaseInternal {
  implements: Set<string>;
  embedded: boolean | Set<string>;
  abstract: boolean;
}

export interface EntityPersistence extends EntityBasePersistence {}

export interface EntityInput
  extends EntityBaseInput<EntityMetaInfo, EntityPersistence> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface EntityOutput
  extends EntityBaseOutput<EntityMetaInfo, EntityPersistence> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface EntityMetaInfo extends EntityBaseMetaInfo<EntityPersistence> {}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

export class Entity
  extends EntityBase<
    EntityMetaInfo,
    EntityInput,
    EntityInternal,
    EntityPersistence,
    EntityOutput
  >
  implements IEntity {
  public get modelType(): MetaModelType {
    return 'entity';
  }

  constructor(init: EntityInput) {
    super(merge({}, defaultInput, init));
  }

  get implements(): Set<string> {
    return this[Internal].implements;
  }

  get abstract(): boolean {
    return this[Internal].abstract;
  }

  get embedded(): boolean | Set<string> {
    return this[Internal].embedded;
  }

  public updateWith(input: Nullable<EntityInput>) {
    super.updateWith(input);

    assignValue({
      src: this[Internal],
      input,
      field: 'abstract',
      setDefault: src => (src.abstract = false),
    });
    assignValue<
      EntityInternal,
      EntityInput,
      NonNullable<EntityInput['implements']>
    >({
      src: this[Internal],
      input,
      field: 'implements',
      effect: (src, value) => (src.implements = new Set(value)),
      setDefault: src => (src.implements = new Set()),
    });

    assignValue<
      EntityInternal,
      EntityInput,
      NonNullable<EntityInput['embedded']>
    >({
      src: this[Internal],
      input,
      field: 'embedded',
      effect: (src, value) =>
        (src.embedded = typeof value === 'boolean' ? value : new Set(value)),
      setDefault: src => (src.embedded = false),
    });
  }

  public toObject(): EntityOutput {
    return merge({}, super.toObject(), {
      implements: [...this.implements.values()],
      embedded: this.embedded,
      abstract: this.abstract,
    } as Partial<EntityOutput>);
  }

  public mergeWith(payload: Nullable<EntityInput>) {
    super.mergeWith(payload);
  }

  public build() {
    /** replace object types */
    const inputs: ObjectTypeInput[] = [];
    const payloads: ObjectTypeInput[] = [];
    const mutations: MutationInput[] = [];
    const queries: QueryInput[] = [];

    this.operations.forEach(op => {
      if (
        op.actionType === 'create' ||
        op.actionType === 'update' ||
        op.actionType === 'delete' ||
        op.actionType === 'addTo' ||
        op.actionType === 'removeFrom'
      ) {
        let payload = payloadToObject(op);

        let name = op.name;
        let args: NamedArray<
          ObjectTypeFieldInput | ObjectTypeInput
        > = MapToArray(op.args, (_name, value) => value.toObject());

        if (!op.custom) {
          switch (op.actionType) {
            case 'create':
              {
                /** input */
                const input: ObjectTypeInput = {
                  name: `create${op.entity}Input`,
                  kind: 'input',
                  fields: getCreateFields(this),
                };
                inputs.push(input);
                /** payload */
                const payload: ObjectTypeInput = {
                  name: `create${op.entity}Payload`,
                  kind: 'output',
                  fields: [
                    {
                      name: decapitalize(this.name),
                      type: `${this.plural}Edge`,
                    } as ObjectTypeFieldInput,
                  ],
                };
                payloads.push(input);

                /** mutation */
                mutations.push({
                  name: `create${op.entity}`,
                  args: [{ name: 'input', type: input.name }],
                  payload: payload.name,
                });
              }
              break;
            case 'update':
              {
                /** input */
                const input: ObjectTypeInput = {
                  name: `create${op.entity}Input`,
                  kind: 'input',
                  fields: getUpdateFields(this),
                };
                inputs.push(input);
                /** payload */
                const payload: ObjectTypeInput = {
                  name: `update${op.entity}Payload`,
                  kind: 'output',
                  fields: [
                    {
                      name: decapitalize(this.name),
                      type: `${this.name}`,
                    } as ObjectTypeFieldInput,
                  ],
                };
                /** mutation */
                mutations.push({
                  name: `update${op.entity}`,
                  args: [{ name: 'input', type: input.name }],
                  payload: payload.name,
                });
              }
              break;
            case 'delete':
              {
                /** input */
                const input: ObjectTypeInput = {
                  name: `delete${op.entity}Input`,
                  fields: ArgsFromTuples(getUniqueIndexedFields(this)),
                };
                inputs.push(input);
                /** payload */
                const payload: ObjectTypeInput = {
                  name: `delete${op.entity}Payload`,
                  kind: 'output',
                  fields: [
                    {
                      name: decapitalize(this.name),
                      type: `${this.name}`,
                    } as ObjectTypeFieldInput,
                  ],
                };
                payloads.push(payload);
                /** mutation */
                mutations.push({
                  name: `delete${op.entity}`,
                  args: [{ name: 'input', type: input.name }],
                  payload: payload.name,
                });
              }
              break;
            case 'addTo':
              {
                /**
                  input addTo#{field.relation.metadata.name.full}Input {
                    #{decapitalize(entity.name)}: ID!
                    #{connection.refFieldName}: #{connection.embedded ? 'create'+connection.entity+'Input' :'ID'}!
                    #additional Edge fields
                    ///
                    isBelongsToMany(f.relation) && f.relation.fields.size > 0
                  <# connection.fields.forEach(f=>{-#>
                    #{f.name}: #{f.type}
                  <# });-#>
                  }
                */
                if (op.field) {
                  const field = this.fields.get(op.field);
                  if (field && !isISimpleField(field)) {
                    name = `addTo${field.relation.metadata.name.full}`;
                    args = [
                      {
                        name: 'input',
                        type: `addTo${field.relation.metadata.name.full}Input`,
                        required: true,
                      } as ObjectTypeFieldInput,
                    ];
                    payload = `addTo${
                      field.relation.metadata.name.full
                    }Payload`;
                  }
                }
              }
              break;
            case 'removeFrom':
              {
                if (op.field) {
                  const field = this.fields.get(op.field);
                  if (field && !isISimpleField(field)) {
                    name = `removeFrom${field.relation.metadata.name.full}`;
                    args = [
                      {
                        name: 'input',
                        type: `addTo${field.relation.metadata.name.full}Input`,
                        required: true,
                      } as ObjectTypeFieldInput,
                    ];
                    payload = `addTo${
                      field.relation.metadata.name.full
                    }Payload`;
                  }
                }
              }
              break;
          }
        }
        return { ...op.toObject(), name, payload, args };
      } else {
        let name: string = this.name;

        if (!op.custom) {
          switch (op.actionType) {
            case 'readOne':
              name = decapitalize(this.name);
              break;
            case 'readMany':
              name = decapitalize(this.plural);
              break;
          }
        }

        return {
          ...this.toObject(),
          name,
        };
      }
    });
  }
}

function getCreateFields(entity: IEntity) {
  const result: ObjectTypeFieldInput[] = [];
  entity.fields.forEach(f => {
    if (isISimpleField(f)) {
      if (idField(f) || mutableFields(f)) {
        result.push({
          name: f.name,
          title: f.title,
          description: f.description,
          kind: 'input',
          required: f.required,
          type: f.type,
          order: f.order,
        });
      }
    } else {
      if (storedRelations(f)) {
        if (isIEntityField(f)) {
          result.push({
            name: f.name,
            title: f.title,
            description: f.description,
            kind: 'input',
            required: f.required,
            multiplicity: f.type.multiplicity,
            type: `embed${f.type.type}Input`,
            order: f.order,
          });
        } else {
          const createName =
            isBelongsToMany(f.relation) && f.relation.fields.size > 0
              ? `embed${f.relation.ref.entity}UpdateInto${
                  entity.name
                }${capitalize(f.name)}Input`
              : `embed${f.relation.entity}Input`;

          result.push({
            name: f.name,
            title: f.title,
            description: f.description,
            kind: 'input',
            required: f.required,
            multiplicity: f.relation.metadata.persistence.single
              ? 'one'
              : 'many',
            type: createName,
            order: f.order,
          });
        }
      }
    }
  });
  return result;
}

function getUpdateFields(entity: IEntity) {
  const result: ObjectTypeFieldInput[] = [];
  entity.fields.forEach(f => {
    if (isISimpleField(f)) {
      if (idField(f) || mutableFields(f)) {
        result.push({
          name: f.name,
          title: f.title,
          description: f.description,
          kind: 'input',
          required: f.required,
          type: f.type,
          order: f.order,
        });
      }
    } else {
      if (storedRelations(f)) {
        if (isIEntityField(f)) {
          result.push({
            name: f.name,
            title: f.title,
            description: f.description,
            kind: 'input',
            required: f.required,
            multiplicity: f.type.multiplicity,
            type: `embed${f.type.type}Input`,
            order: f.order,
          });
        } else {
          const createName =
            isBelongsToMany(f.relation) && f.relation.fields.size > 0
              ? `embed${f.relation.ref.entity}UpdateInto${
                  entity.name
                }${capitalize(f.name)}Input`
              : `embed${f.relation.entity}Input`;

          const updateName =
            isBelongsToMany(f.relation) && f.relation.fields.size > 0
              ? `embed${f.relation.ref.entity}UpdateInto${
                  entity.name
                }${capitalize(f.name)}Input`
              : `embed${f.relation.entity}Input`;

          result.push({
            name: f.name,
            title: f.title,
            description: f.description,
            kind: 'input',
            required: f.required,
            multiplicity: f.relation.metadata.persistence.single
              ? 'one'
              : 'many',
            type: updateName,
            order: f.order,
          });

          if (!f.relation.metadata.persistence.embedded) {
            result.push({
              name: `${f.name}Unlink`,
              title: f.title,
              description: f.description,
              kind: 'input',
              required: f.required,
              multiplicity: f.relation.metadata.persistence.single
                ? 'one'
                : 'many',
              type: updateName,
              order: f.order,
            });

            result.push({
              name: `${f.name}Create`,
              title: f.title,
              description: f.description,
              kind: 'input',
              required: f.required,
              multiplicity: f.relation.metadata.persistence.single
                ? 'one'
                : 'many',
              type: createName,
              order: f.order,
            });
          }
        }
      }
    }
  });
  return result;
}
