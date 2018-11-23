import {
  IEntity,
  IField,
  IModel,
  IPackage,
  IRelation,
  IValidationResult,
} from '../interfaces';
import {
  IEntityContext,
  IFieldContext,
  IModelContext,
  IPackageContext,
  IRelationContext,
} from './interfaces';

export type RestartType = 'model' | 'package' | 'entity' | 'field' | 'relation';

export class RestartLevelError extends Error {}

export class ModelLevel extends RestartLevelError {}
export class PackageLevel extends RestartLevelError {}
export class EntityLevel extends RestartLevelError {}
export class FieldLevel extends RestartLevelError {}
export class RelationLevel extends RestartLevelError {}

export function restart(type: RestartType) {
  switch (type) {
    case 'model':
      throw new ModelLevel();
    case 'package':
      throw new PackageLevel();
    case 'entity':
      throw new EntityLevel();
    case 'field':
      throw new FieldLevel();
    case 'relation':
      throw new RelationLevel();
    default:
      throw Error('unknown restart level');
  }
}

export class ModelContext implements IModelContext {
  public model: IModel;
  public errors: IValidationResult[];
  constructor(model: IModel) {
    this.model = model;
    this.errors = [];
  }
  public get isValid() {
    return !!this.model;
  }

  public restart(_level: RestartType) {
    restart('model');
  }
}

export class PackageContext implements IPackageContext {
  public name?: string;
  public model: IModel;
  public package: IPackage;
  public errors: IValidationResult[];
  constructor(context: IModelContext, pkg: IPackage) {
    this.model = context.model;
    this.package = pkg;
    this.errors = [];
  }
  public get isValid() {
    return !!(this.model && this.package);
  }

  public restart(_level: RestartType) {
    restart('package');
  }
}

export class EntityContext implements IEntityContext {
  public entity: IEntity;
  public model: IModel;
  public package: IPackage;
  public errors: IValidationResult[];
  constructor(context: IPackageContext, entity: IEntity) {
    this.model = context.model;
    this.package = context.package;
    this.entity = entity;
    this.errors = [];
  }
  public get isValid() {
    return !!(this.model && this.package && this.entity);
  }

  public restart(_level: RestartType) {
    restart('entity');
  }
}

export class FieldContext implements IFieldContext {
  public model: IModel;
  public package: IPackage;
  public entity: IEntity;
  public field: IField;
  public errors?: IValidationResult[];
  constructor(context: IEntityContext, field: IField) {
    this.model = context.model;
    this.package = context.package;
    this.entity = context.entity;
    this.field = field;
  }
  public get isValid() {
    return !!(this.model && this.package && this.entity && this.field);
  }

  public restart(_level: RestartType) {
    restart('field');
  }
}

export class RelationContext implements IRelationContext {
  public model: IModel;
  public package: IPackage;
  public entity: IEntity;
  public field: IField;
  public relation: IRelation;
  public errors?: IValidationResult[];
  constructor(context: IFieldContext, relation: IRelation) {
    this.model = context.model;
    this.package = context.package;
    this.entity = context.entity;
    this.field = context.field;
    this.relation = relation;
  }
  public get isValid() {
    return !!(
      this.model &&
      this.package &&
      this.entity &&
      this.field &&
      this.relation
    );
  }

  public restart(_level: RestartType) {
    restart('relation');
  }
}
