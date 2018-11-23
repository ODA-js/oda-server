import { IValidationResult } from '../../../interfaces';
import { IFieldContext } from '../../interfaces';
import { Rule } from '../../rules';

export default class implements Rule<IFieldContext> {
  public name = 'field-empty-name';
  public description = 'field must be named';
  public validate(context: IFieldContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (!context.field.name) {
      result.push({
        message: this.description,
        result: 'error',
      });
    }
    return result;
  }
}
