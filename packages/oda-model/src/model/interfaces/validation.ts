export interface IValidate {
  validate(validator: IValidator): ValidationResultInput[];
}

export interface IValidator {
  check(item: IValidate): ValidationResultInput[];
}

export type ValidationResultKind = 'error' | 'warning' | 'critics' | 'fixable';

export interface ValidationResultInput {
  result: ValidationResultKind;
  message: string;
}

export interface IValidationResultField extends ValidationResultInput {
  field: string;
}
export interface IValidationResultEntity extends IValidationResultField {
  entity: string;
}
export interface IValidationResultPackage extends IValidationResultEntity {
  package: string;
}
export interface IValidationResultModel extends IValidationResultPackage {
  model?: string;
}
