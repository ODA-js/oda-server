/**
 *
 */
import {
  ModelBaseInternal,
  IModelBase,
  ModelBaseInput,
  ModelBaseMetaInfo,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  OperationKind,
  AsHash,
  MetaModelType,
  assignValue,
  NamedArray,
  MapToArray,
  Nullable,
  EnumType,
  EntityType,
  isBelongsToMany,
} from './types';
import { payloadToObject } from './payloadToObject';
import { applyArgs } from './applyArgs';
import { applyPayload } from './applyPayload';
import { merge } from 'lodash';
import { Internal, MetaData } from './element';
import decapitalize from './lib/decapitalize';
import { IObjectTypeField, ObjectTypeFieldInput } from './objecttypefield';
import { QueryInput } from './query';
import { MutationInput } from './mutation';
import { IEntity } from './entity';
import { IRelationField } from './relationfield';
import { isISimpleField, isIEntityField } from './field';
import { IObjectType, ObjectTypeInput } from './objecttype';
import {
  idField,
  mutableFields,
  storedRelations,
  ArgsFromTuples,
  getUniqueIndexedFields,
} from './utils/queries';
import capitalize from './lib/capitalize';

/**
 * Kind of mutation which is intended to work with single entity
 */
export interface IOperation
  extends IModelBase<OperationMetaInfo, OperationInput, OperationOutput> {
  /**
   * action type
   * CRUD
   */
  readonly actionType: OperationKind;
  /**
   * is it field inherited from other entity and which one
   */
  readonly inheritedFrom?: string;
  /**
   * set of arguments
   */
  readonly args?: Map<string, IObjectType | IObjectTypeField>;
  readonly payload:
    | string
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
  readonly order: number;
  readonly entity: string;
  readonly field?: string;
}

export interface OperationMetaInfo extends ModelBaseMetaInfo {
  entity: string;
  field?: string;
  order: number;
  acl: {
    /** if packages allowed to execute mutation */
    execute: string[];
  };
}

export interface OperationInput extends ModelBaseInput<OperationMetaInfo> {
  args?:
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
  payload?:
    | string
    | EnumType
    | EntityType
    | ObjectTypeInput
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;

  inheritedFrom?: string;
  entity?: string;
  field?: string;
  actionType: OperationKind;
  custom?: boolean;
  order?: number;
}

export interface OperationOutput extends ModelBaseOutput<OperationMetaInfo> {
  args: NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
  payload:
    | string
    | EnumType
    | EntityType
    | ObjectTypeInput
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
  inheritedFrom?: string;
  entity: string;
  field?: string;
  custom: boolean;
  actionType: OperationKind;
  order: number;
}

export interface OperationInternal extends ModelBaseInternal {
  args: Map<string, IObjectType | IObjectTypeField>;
  payload:
    | string
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
  inheritedFrom?: string;
  /** хранит ссылку на entity */
  entity?: IEntity;
  /** хранит ссылку на поле */
  field?: IRelationField;
  custom: boolean;
  actionType: OperationKind;
}

export const operationDefaultMetaInfo = { acl: { execute: [] } };
export const operationDefaultInput = { metadata: operationDefaultMetaInfo };

export class Operation
  extends ModelBase<
    OperationMetaInfo,
    OperationInput,
    OperationInternal,
    OperationOutput
  >
  implements IOperation {
  public get modelType(): MetaModelType {
    return 'operation';
  }

  public get actionType(): OperationKind {
    return this[Internal].actionType;
  }

  public get custom(): Boolean {
    return this[Internal].custom;
  }

  get inheritedFrom(): string | undefined {
    return this[Internal].inheritedFrom;
  }

  get args(): Map<string, IObjectType | IObjectTypeField> {
    return this[Internal].args;
  }

  get payload():
    | string
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField> {
    return this[Internal].payload;
  }

  get order(): number {
    return this.metadata.order;
  }

  get entity(): string {
    return this.metadata.entity;
  }

  get field(): string | undefined {
    return this.metadata.field;
  }

  constructor(init: OperationInput) {
    super(merge({}, operationDefaultInput, init));
  }

  public updateWith(input: Nullable<OperationInput>) {
    super.updateWith(input);

    assignValue<OperationInternal, OperationInput, OperationInput['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value.trim())),
      required: true,
    });

    assignValue<
      OperationMetaInfo,
      OperationInput,
      NonNullable<OperationInput['entity']>
    >({
      src: this[MetaData],
      input,
      field: 'entity',
      effect: (src, value) => (src.entity = value),
    });

    assignValue<
      OperationMetaInfo,
      OperationInput,
      NonNullable<OperationInput['field']>
    >({
      src: this.metadata,
      input,
      field: 'field',
      effect: (src, value) => (src.field = value),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['custom']>
    >({
      src: this[Internal],
      input,
      field: 'custom',
      effect: (src, value) => (src.custom = value),
      setDefault: src => (src.custom = false),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['actionType']>
    >({
      src: this[Internal],
      input,
      field: 'actionType',
    });

    assignValue<
      OperationMetaInfo,
      OperationInput,
      NonNullable<OperationInput['order']>
    >({
      src: this.metadata,
      input,
      field: 'order',
      effect: (src, value) => (src.order = value),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['args']>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: applyArgs,
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<
      OperationInternal,
      OperationInput,
      NonNullable<OperationInput['payload']>
    >({
      src: this[Internal],
      input,
      field: 'payload',
      effect: applyPayload,
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): OperationOutput {
    const internal = this[Internal];
    const payload = payloadToObject(internal);
    return merge({}, super.toObject(), {
      actionType: this.actionType,
      custom: this.custom,
      inheritedFrom: this.inheritedFrom,
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload,
    } as Partial<OperationOutput>);
  }

  public toMutation(entity: IEntity): MutationInput | undefined {
    if (
      this.actionType === 'create' ||
      this.actionType === 'update' ||
      this.actionType === 'delete' ||
      this.actionType === 'addTo' ||
      this.actionType === 'removeFrom'
    ) {
      const internal = this[Internal];
      let payload = payloadToObject(internal);

      let name = this.name;
      let args: NamedArray<ObjectTypeFieldInput | ObjectTypeInput> = MapToArray(
        internal.args,
        (_name, value) => value.toObject(),
      );

      if (!this.custom) {
        switch (this.actionType) {
          case 'create': {
            let fields = getCreateFields(entity);
            return {
              name: `create${this.entity}`,
              args: [
                {
                  name: `create${this.entity}Input`,
                  fields,
                } as ObjectTypeFieldInput,
              ],
              payload: {
                name: `create${this.entity}Payload`,
                kind: 'output',
                fields: [
                  {
                    name: decapitalize(entity.name),
                    type: `${entity.plural}Edge`,
                  } as ObjectTypeFieldInput,
                ],
              } as ObjectTypeInput,
            };
          }
          case 'update': {
            let fields = getUpdateFields(entity);
            return {
              name: `update${this.entity}`,
              args: [
                {
                  name: `create${this.entity}Input`,
                  kind: 'input',
                  fields,
                },
              ],
              payload: {
                name: `update${this.entity}Payload`,
                kind: 'output',
                fields: [
                  {
                    name: decapitalize(entity.name),
                    type: `${entity.name}`,
                  } as ObjectTypeFieldInput,
                ],
              } as ObjectTypeInput,
            };
          }
          case 'delete':
            name = `delete${this.entity}`;
            payload = `delete${this.entity}Payload`;
            return {
              name: `update${this.entity}`,
              args: [
                {
                  name: `delete${this.entity}Input`,
                  fields: ArgsFromTuples(getUniqueIndexedFields(entity)),
                },
              ],
              payload: {
                name: `delete${this.entity}Payload`,
                kind: 'output',
                fields: [
                  {
                    name: decapitalize(entity.name),
                    type: `${entity.name}`,
                  } as ObjectTypeFieldInput,
                ],
              } as ObjectTypeInput,
            };
          case 'addTo':
            if (this.field) {
              const field = entity.fields.get(this.field);
              if (field && !isISimpleField(field)) {
                name = `addTo${field.relation.metadata.name.full}`;
                args = [
                  {
                    name: 'input',
                    type: `addTo${field.relation.metadata.name.full}Input`,
                    required: true,
                  } as ObjectTypeFieldInput,
                ];
                payload = `addTo${field.relation.metadata.name.full}Payload`;
              }
            }
            break;
          case 'removeFrom':
            if (this.field) {
              const field = entity.fields.get(this.field);
              if (field && !isISimpleField(field)) {
                name = `removeFrom${field.relation.metadata.name.full}`;
                args = [
                  {
                    name: 'input',
                    type: `addTo${field.relation.metadata.name.full}Input`,
                    required: true,
                  } as ObjectTypeFieldInput,
                ];
                payload = `addTo${field.relation.metadata.name.full}Payload`;
              }
            }
            break;
        }
      }
      return { ...this.toObject(), name, payload, args };
    } else {
      return;
    }
  }

  public toQuery(_entity: IEntity): QueryInput | undefined {
    if (
      (this.actionType === 'readOne' || this.actionType === 'readMany') &&
      _entity
    ) {
      let name: string = this.name;

      if (!this.custom) {
        switch (this.actionType) {
          case 'readOne':
            name = decapitalize(_entity.name);
            break;
          case 'readMany':
            name = decapitalize(_entity.plural);
            break;
        }
      }

      return {
        ...this.toObject(),
        name,
      };
    } else {
      return;
    }
  }

  public mergeWith(payload: Nullable<OperationInput>) {
    super.mergeWith(payload);
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
