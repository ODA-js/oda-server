import { IValidationResult } from '../../../interfaces';
import { IFieldContext, IRelationContext } from '../../interfaces';
import { Rule } from '../../rules';

export class RelationRule implements Rule<IRelationContext> {
  public name: string;
  public description: string;
  public validate(_context: IFieldContext): IValidationResult[] {
    throw new Error('Method not implemented.');
  }
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
