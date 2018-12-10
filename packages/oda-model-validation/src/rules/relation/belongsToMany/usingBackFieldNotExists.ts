import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-btm-ref-backFielnd-not-exists-fix';
  public description = 'back field not exists. fixed.';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.using && context.relation.using.backField) {
      const bf = context.entity.fields.get(context.relation.using.backField);
      if (!bf) {
        context.relation.using.backField = 'id';
        result.push({
          message: this.description,
          result: 'fixable',
        });
      }
    }
    return result;
  }
}
