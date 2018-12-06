import { IValidationResult } from '../interfaces';
import { ValidationContext } from './interfaces';

export interface Rule<T extends ValidationContext> {
  name: string;
  description: string;
  validate(context: T): IValidationResult[];
}
