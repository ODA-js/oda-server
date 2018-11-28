export interface IValidate {
  validate(validator: IValidator): IValidationResultInput[];
}

export interface IValidator {
  check(item: IValidate): IValidationResultInput[];
}

export type ValidationResultKind = 'error' | 'warning' | 'critics' | 'fixable';

export interface IValidationResultInput {
  result: ValidationResultKind;
  message: string;
}

export interface IValidationResultField extends IValidationResultInput {
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
