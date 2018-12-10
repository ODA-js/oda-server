import { IValidationResult } from '../../../interfaces';
import { IModelContext } from '../../interfaces';
import { Rule } from '../../rules';

export default class implements Rule<IModelContext> {
  public name = 'model-empty-name';
  public description = 'model must be named';
  public validate(context: IModelContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (!context.model.name) {
      result.push({
        message: this.description,
        result: 'error',
      });
    }
    return result;
  }
}
