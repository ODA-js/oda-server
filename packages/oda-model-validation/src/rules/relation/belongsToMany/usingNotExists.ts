import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name =
    'relation-btm-ref-using-is-not-exists-for-belongs-to-many-relation';
  public description = 'using is not exists for belongs to many relation';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (!context.relation.using) {
      result.push({
        message: this.description,
        result: 'warning',
      });
    }
    return result;
  }
}
