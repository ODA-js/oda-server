import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-common-ref-backFielnd-not-exists-fix';
  public description = 'back field not exists. fixed.';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.ref.backField) {
      const bf = context.entity.fields.get(context.relation.ref.backField);
      if (!bf) {
        context.relation.ref.backField = 'id';
        result.push({
          message: this.description,
          result: 'fixable',
        });
      }
    }
    return result;
  }
}
