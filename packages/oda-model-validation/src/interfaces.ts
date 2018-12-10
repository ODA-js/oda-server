import { IEntity, ISimpleField, IModel, IPackage, IRelation } from 'oda-model';
import { RestartType } from './contexts';

export interface IModelContext {
  model: IModel;
  restart(level: RestartType): void;
}

export interface IPackageContext {
  model: IModel;
  package: IPackage;
  restart(level: RestartType): void;
}

export interface IEntityContext {
  model: IModel;
  package: IPackage;
  entity: IEntity;
  restart(level: RestartType): void;
}

export interface IFieldContext {
  model: IModel;
  package: IPackage;
  entity: IEntity;
  field: ISimpleField;
  restart(level: RestartType): void;
}

export interface IRelationContext {
  model: IModel;
  package: IPackage;
  entity: IEntity;
  field: ISimpleField;
  relation: IRelation;
  restart(level: RestartType): void;
}

export type ValidationContext =
  | IModelContext
  | IPackageContext
  | IEntityContext
  | IFieldContext
  | IRelationContext;
