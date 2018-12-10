import { IValidationResultInput } from 'oda-model';
import { ValidationContext } from './interfaces';

export interface Rule<T extends ValidationContext> {
  name: string;
  description: string;
  validate(context: T): IValidationResultInput[];
}
