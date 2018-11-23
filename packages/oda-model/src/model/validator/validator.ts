import {
  IModelType,
  isEntity,
  isField,
  isModel,
  isPackage,
  isRelation,
  IValidationResult,
  IValidator,
  MetaModelType,
} from '../interfaces';
import {
  IEntityContext,
  IFieldContext,
  IModelContext,
  IPackageContext,
  ValidationContext,
} from './interfaces';
import { Rule } from './rules';
import {
  EntityVisitor,
  FieldVisitor,
  ModelVisitor,
  PackageVisitor,
  RelationVisitor,
} from './visitors';

export class Validator implements IValidator {
  public errors: IValidationResult[];
  public rules: { [modelType: string]: object[] };
  public constructor() {
    this.errors = [];
    this.rules = {};
  }

  public registerRule<T extends ValidationContext>(
    modelType: MetaModelType,
    rule: Rule<T>[],
  ) {
    if (!this.rules[modelType]) {
      this.rules[modelType] = [];
    }
    this.rules[modelType].push(...rule);
  }

  public getRules<T extends ValidationContext>(
    modelType: MetaModelType,
  ): Rule<T>[] {
    return <Rule<T>[]>this.rules[modelType] || [];
  }

  public check(
    item: any,
    options?: {
      model?: IModelContext;
      package?: IPackageContext;
      entity?: IEntityContext;
      field?: IFieldContext;
    },
  ): IValidationResult[] {
    if (isModel(item)) {
      return new ModelVisitor(this).visit(item);
    }
    if (isPackage(item)) {
      return new PackageVisitor(this).visit(item);
    }
    if (isEntity(item) && options && options.package) {
      return new EntityVisitor(this, options.package).visit(item);
    }
    if (isField(item) && options && options.entity) {
      return new FieldVisitor(this, options.entity).visit(item);
    }
    if (isRelation(item) && options && options.field) {
      return new RelationVisitor(this, options.field).visit(item);
    }
    return [];
  }
}

export interface IVisitor<T extends IModelType, C extends ValidationContext> {
  context?: C;
  visit(item: T): void;
}
