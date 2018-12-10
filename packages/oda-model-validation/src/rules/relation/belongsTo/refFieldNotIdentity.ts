import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-belongsTo-ref-field-not-identity-fix';
  public description = 'referenced field not identity';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    const entity = context.package.entities.get(context.relation.ref.entity);
    if (entity) {
      let refField = entity.fields.get(context.relation.ref.field);
      if (refField && !refField.identity) {
        const update = refField.toJSON();
        update.identity = true;
        update.entity = context.entity.name;
        refField.updateWith(update);
        result.push({
          message: this.description,
          result: 'fixable',
        });
      }
    }
    return result;
  }
}
