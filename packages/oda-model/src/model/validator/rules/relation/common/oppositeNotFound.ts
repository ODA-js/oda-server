import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-common-opposite-not-found';
  public description = 'opposite field not found';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.opposite) {
      const entity = context.package.entities.get(context.relation.ref.entity);
      if (entity && !entity.fields.has(context.relation.opposite)) {
        const update = context.relation.toObject();
        delete update.opposite;
        update.entity = context.entity.name;
        context.relation.updateWith(update);
        result.push({
          message: this.description,
          result: 'fixable',
        });
      }
    }
    return result;
  }
}
