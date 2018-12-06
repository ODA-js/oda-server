import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-btm-using-field-not-found';
  public description = 'using entity not found';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.using) {
      const entity = context.package.entities.get(
        context.relation.using.entity,
      );
      if (entity) {
        let refField = entity.fields.get(context.relation.using.field);
        if (!refField) {
          result.push({
            message: this.description,
            result: 'warning',
          });
        }
      }
    }
    return result;
  }
}
