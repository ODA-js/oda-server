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
import { isISimpleField, isIEntityField, IField } from './field';
import {
  idField,
  mutableFields,
  storedRelations,
  ArgsFromTuples,
  getUniqueIndexedFields,
  getGeneralIndexedFields,
} from './utils/queries';
import capitalize from './lib/capitalize';
import { payloadToObject } from './payloadToObject';
import { ObjectTypeInput, isObjectTypeInput } from './objecttype';
import decapitalize from './lib/decapitalize';
import { QueryInput } from './query';
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

    /** indexes */
    const indexedFields = ArgsFromTuples(
      getUniqueIndexedFields(this),
      name => `${name}${this.name}IdentityInput`,
    );

    indexedFields.forEach(f => {
      if (isObjectTypeInput(f.type)) {
        inputs.push(f.type);
        f.type = f.type.name;
      }
    });

    /** unique */
    const uniqueFields = ArgsFromTuples(
      getGeneralIndexedFields(this),
      name => `${name}${this.name}IdentityInput`,
    );

    uniqueFields.forEach(f => {
      if (isObjectTypeInput(f.type)) {
        inputs.push(f.type);
        f.type = f.type.name;
      }
    });

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
                  fields: getCreateFields(this.fields, this.name),
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
                payloads.push(payload);

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
                payloads.push(payload);
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
                  fields: uniqueFields,
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
                if (op.field) {
                  const field = this.fields.get(op.field);
                  if (field && !isISimpleField(field)) {
                    /** args */
                    let sameEntity = this.name === field.relation.ref.entity;
                    let refFieldName = `${field.relation.ref.entity}${
                      sameEntity ? capitalize(field.name) : ''
                    }`;

                    const input: ObjectTypeInput = {
                      name: `addTo${field.relation.metadata.name.full}Input`,
                      fields: [
                        {
                          name: decapitalize(this.name),
                          type: 'ID',
                          required: true,
                        },
                        {
                          name: decapitalize(refFieldName),
                          type: field.relation.metadata.persistence.embedded
                            ? 'create' + field.relation.ref.entity + 'Input'
                            : 'ID',
                          required: true,
                        },
                        ...(() => {
                          if (
                            isBelongsToMany(field.relation) &&
                            field.relation.fields.size > 0
                          ) {
                            const using = field.relation.using.entity;
                            return getCreateFields(
                              field.relation.fields,
                              using,
                            );
                          } else {
                            return [];
                          }
                        })(),
                      ],
                    };
                    inputs.push(input);
                    /** payload */
                    const payload: ObjectTypeInput = {
                      name: `addTo${field.relation.metadata.name.full}Payload`,
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
                      name: `addTo${field.relation.metadata.name.full}`,
                      args: [
                        {
                          name: 'input',
                          required: true,
                          type: input.name,
                        },
                      ],
                      payload: payload.name,
                    });
                  }
                }
              }
              break;
            case 'removeFrom':
              {
                if (op.field) {
                  const field = this.fields.get(op.field);
                  if (field && !isISimpleField(field)) {
                    /** args */
                    let sameEntity = this.name === field.relation.ref.entity;
                    let refFieldName = `${field.relation.ref.entity}${
                      sameEntity ? capitalize(field.name) : ''
                    }`;

                    const fields = [
                      {
                        name: decapitalize(this.name),
                        type: 'ID',
                        required: true,
                      },
                    ];

                    if (field.relation.metadata.persistence.embedded) {
                      fields.push({
                        name: decapitalize(refFieldName),
                        type: 'ID',
                        required: true,
                      });
                    }

                    const input: ObjectTypeInput = {
                      name: `removeFrom${
                        field.relation.metadata.name.full
                      }Input`,
                      fields,
                    };
                    inputs.push(input);
                    /** payload */
                    const payload: ObjectTypeInput = {
                      name: `removeFrom${
                        field.relation.metadata.name.full
                      }Payload`,
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
                      name: `removeFrom${field.relation.metadata.name.full}`,
                      args: [
                        {
                          name: 'input',
                          required: true,
                          type: input.name,
                        },
                      ],
                      payload: payload.name,
                    });
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
              {
                /** mutation */
                queries.push({
                  name: decapitalize(this.name),
                  args: uniqueFields,
                  payload: { name: this.name, type: 'entity' },
                });
              }
              break;
            case 'readManyConnection':
              // after: String, first: Int, before: String, last: Int, limit: Int, skip: Int, orderBy: [#{ctx.entry.name}SortOrder], filter: #{ctx.entry.name}ComplexFilter
              queries.push({
                name: decapitalize(this.plural),
                args: [
                  {
                    name: 'after',
                    type: 'String',
                  },
                  {
                    name: 'first',
                    type: 'String',
                  },
                  {
                    name: 'before',
                    type: 'String',
                  },
                  {
                    name: 'last',
                    type: 'String',
                  },
                  {
                    name: 'limit',
                    type: 'Int',
                  },
                  {
                    name: 'skip',
                    type: 'Int',
                  },
                  /** сложные типы */
                  {
                    name: 'orderBy',
                    type: `${this.name}SortOrder`,
                    multiplicity: 'many',
                  } as ObjectTypeFieldInput,
                  {
                    name: 'filter',
                    type: `${this.name}ComplexFilter`,
                    multiplicity: 'many',
                  } as ObjectTypeFieldInput,
                ],
                payload: { name: this.name, type: 'entity' },
              });
              break;
            case 'readManyList':
              name = `${decapitalize(this.plural)}Items`;
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

function getCreateFields(fields: Map<string, IField>, entityName: string) {
  const result: ObjectTypeFieldInput[] = [];
  fields.forEach(f => {
    const field = processFields(f, entityName);
    if (field) {
      result.push(field);
    }
  });
  return result;
}

function processFields(
  f: IField,
  entityName: string,
): ObjectTypeFieldInput | null {
  let result: ObjectTypeFieldInput | null = null;
  if (isISimpleField(f)) {
    if (idField(f) || mutableFields(f)) {
      result = {
        name: f.name,
        title: f.title,
        description: f.description,
        kind: 'input',
        required: f.required,
        type: f.type,
        order: f.order,
      };
    }
  } else {
    if (storedRelations(f)) {
      if (isIEntityField(f)) {
        result = {
          name: f.name,
          title: f.title,
          description: f.description,
          kind: 'input',
          required: f.required,
          multiplicity: f.type.multiplicity,
          type: `embed${f.type.type}Input`,
          order: f.order,
        };
      } else {
        const createName =
          isBelongsToMany(f.relation) && f.relation.fields.size > 0
            ? `embed${f.relation.ref.entity}UpdateInto${entityName}${capitalize(
                f.name,
              )}Input`
            : `embed${f.relation.entity}Input`;
        result = {
          name: f.name,
          title: f.title,
          description: f.description,
          kind: 'input',
          required: f.required,
          multiplicity: f.relation.metadata.persistence.single ? 'one' : 'many',
          type: createName,
          order: f.order,
        };
      }
    }
  }
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
