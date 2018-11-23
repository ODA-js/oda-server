import { Entity } from '../../../../entity';
import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-btm-using-fields-check';
  public description = 'relation using fields check failed';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.using) {
      const entity = context.package.entities.get(
        context.relation.using.entity,
      );
      if (entity) {
        if (context.relation.fields) {
          context.relation.fields.forEach(field => {
            const found = entity.fields.get(field.name);
            if (found) {
              if (found.type !== field.type) {
                const update = found.toJSON();
                update.type = field.type;
                update.entity = context.entity.name;
                found.updateWith(update);
                result.push({
                  message: `type of relation field '${
                    field.name
                  }' and in using entity differs`,
                  result: 'fixable',
                });
              }
            } else {
              const update = (<Entity>entity).toJSON();
              if (update && update.fields) {
                update.fields.push({
                  ...field.toJSON(),
                  entity: context.entity.name,
                });
                (<Entity>entity).updateWith(update);
                result.push({
                  message: `${field.name} is not met in using entity`,
                  result: 'fixable',
                });
              }
            }
          });
        }
      }
    }
    return result;
  }
}
