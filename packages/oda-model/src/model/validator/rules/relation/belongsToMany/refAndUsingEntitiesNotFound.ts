import { Field } from '../../../../field';
import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-btm-ref-and-using-entities-not-found-remove';
  public description =
    'referenced and using entities not found. remove relation';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    const entity = context.package.entities.get(context.relation.ref.entity);
    if (!entity) {
      if (
        context.relation &&
        context.relation.using &&
        context.relation.using.entity
      ) {
        const refEntity = context.package.entities.get(
          context.relation.using.entity,
        );
        if (!refEntity) {
          const update = (<Field>context.field).toJSON();
          delete update.relation;
          update.entity = context.entity.name;
          (<Field>context.field).updateWith(update);
          result.push({
            message: this.description,
            result: 'fixable',
          });
        }
      }
    }

    return result;
  }
}
