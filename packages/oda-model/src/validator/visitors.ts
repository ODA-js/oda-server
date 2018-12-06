import {
  IEntity,
  ISimpleField,
  IModel,
  IPackage,
  IRelation,
  IValidationResult,
} from '../interfaces';
import {
  EntityContext,
  EntityLevel,
  FieldContext,
  FieldLevel,
  ModelContext,
  PackageContext,
  PackageLevel,
  RelationContext,
  RelationLevel,
  RestartLevelError,
} from './contexts';
import {
  IEntityContext,
  IFieldContext,
  IModelContext,
  IPackageContext,
} from './interfaces';
import { IVisitor, Validator } from './validator';

export class ModelVisitor {
  public validator: Validator;
  public visit(model: IModel): IValidationResult[] {
    const context = new ModelContext(model);
    const result: IValidationResult[] = [];
    if (context.isValid) {
      let done = false;
      while (!done) {
        try {
          const rules = this.validator.getRules('model');
          rules.forEach(rule => result.push(...rule.validate(context)));
          Array.from(model.packages.values())
            .filter(p => p.name !== model.name)
            .forEach(p => {
              result.push(...this.validator.check(p, { model: context }));
            });
          done = true;
        } catch (err) {
          if (!(err instanceof RestartLevelError)) {
            throw err;
          }
        }
      }
    } else {
      result.push({
        model: context.model.name,
        message: 'Validation context invalid',
        result: 'error',
      });
    }
    return result.map(r => ({
      ...r,
      model: context.model.name,
    }));
  }
  constructor(validator: Validator) {
    this.validator = validator;
  }
}

export class PackageVisitor implements IVisitor<IPackage, IModelContext> {
  public validator: Validator;
  public context?: IModelContext; // has to be parent context
  public visit(item: IPackage): IValidationResult[] {
    if (!this.context) {
      this.context = new ModelContext(item.metaModel);
    }
    const context = new PackageContext(this.context, item);
    const result: IValidationResult[] = [];
    if (context.isValid) {
      let done = false;
      while (!done) {
        try {
          const rules = this.validator.getRules('package');
          rules.forEach(rule => result.push(...rule.validate(context)));
          item.entities.forEach(p => {
            result.push(...this.validator.check(p, { package: context }));
          });
          done = true;
        } catch (err) {
          if (!(err instanceof PackageLevel)) {
            throw err;
          }
        }
      }
    } else {
      result.push({
        package: context.package.name,
        message: 'Validation context invalid',
        result: 'error',
      });
    }
    return result.map(r => ({
      ...r,
      package: context.package.name,
    }));
  }

  constructor(validator: Validator, model?: IModelContext) {
    this.validator = validator;
    this.context = model;
  }
}

export class EntityVisitor implements IVisitor<IEntity, IPackageContext> {
  public validator: Validator;
  public context: IPackageContext; // has to be parent context
  public visit(item: IEntity): IValidationResult[] {
    const context = new EntityContext(this.context, item);
    const result: IValidationResult[] = [];
    if (context.isValid) {
      let done = false;
      while (!done) {
        try {
          const rules = this.validator.getRules('entity');
          rules.forEach(rule => result.push(...rule.validate(context)));
          const fields = [...item.fields.values()];
          fields
            .filter(f => {
              let read = f.getMetadata('acl.read') as void | string[];
              if (typeof read === 'string') {
                read = [read];
              }
              if (read && read.length > 0) {
                if (read.indexOf(context.package.name) > -1) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return true;
              }
            })
            .forEach(p => {
              result.push(...this.validator.check(p, { entity: context }));
            });
          done = true;
        } catch (err) {
          if (!(err instanceof EntityLevel)) {
            throw err;
          }
        }
      }
    } else {
      result.push({
        entity: context.entity.name,
        message: 'Validation context invalid',
        result: 'error',
      });
    }
    return result.map(r => ({
      ...r,
      entity: context.entity.name,
    }));
  }

  constructor(validator: Validator, pkg: IPackageContext) {
    this.validator = validator;
    this.context = pkg;
  }
}

export class FieldVisitor implements IVisitor<ISimpleField, IEntityContext> {
  public validator: Validator;
  public context: IEntityContext; // has to be parent context
  public visit(item: ISimpleField) {
    const context = new FieldContext(this.context, item);
    const result = [];
    if (context.isValid) {
      let done = false;
      while (!done) {
        try {
          const rules = this.validator.getRules('field');
          rules.forEach(rule => result.push(...rule.validate(context)));
          if (item.relation) {
            result.push(
              ...this.validator.check(item.relation, { field: context }),
            );
          }
          done = true;
        } catch (err) {
          if (!(err instanceof FieldLevel)) {
            throw err;
          }
        }
      }
    } else {
      result.push({
        message: 'Validation context invalid',
        result: 'error',
      });
    }
    return result.map(r => ({
      ...r,
      field: context.field.name,
    }));
  }

  constructor(validator: Validator, pkg: IEntityContext) {
    this.validator = validator;
    this.context = pkg;
  }
}

export class RelationVisitor implements IVisitor<IRelation, IFieldContext> {
  public validator: Validator;
  public context: IFieldContext; // has to be parent context
  public visit(item: IRelation): IValidationResult[] {
    const context = new RelationContext(this.context, item);
    const result: IValidationResult[] = [];
    if (context.isValid) {
      let done = false;
      while (!done) {
        try {
          const rules = this.validator.getRules('relation');
          rules.forEach(rule => result.push(...rule.validate(context)));
          switch (item.verb) {
            case 'BelongsTo': {
              const belongsTo = this.validator.getRules('BelongsTo');
              belongsTo.forEach(rule => result.push(...rule.validate(context)));
              break;
            }
            case 'BelongsToMany': {
              const belongsToMany = this.validator.getRules('BelongsToMany');
              belongsToMany.forEach(rule =>
                result.push(...rule.validate(context)),
              );
              break;
            }
            case 'HasOne': {
              const hasOne = this.validator.getRules('HasOne');
              hasOne.forEach(rule => result.push(...rule.validate(context)));
              break;
            }
            case 'HasMany': {
              const hasMany = this.validator.getRules('HasMany');
              hasMany.forEach(rule => result.push(...rule.validate(context)));
              break;
            }
            default:
          }
          done = true;
        } catch (err) {
          if (!(err instanceof RelationLevel)) {
            throw err;
          }
        }
      }
    } else {
      result.push({
        message: 'Validation context invalid',
        result: 'error',
      });
    }
    return result;
  }

  constructor(validator: Validator, pkg: IFieldContext) {
    this.validator = validator;
    this.context = pkg;
  }
}
