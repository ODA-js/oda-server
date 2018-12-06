import { BelongsToMany } from '../../../../belongstomany';
import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-common-possible-opposite';
  public description = 'relation-common-possible-opposite';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (!context.relation.opposite) {
      const entity = context.package.entities.get(context.relation.ref.entity);
      if (entity) {
        let opposites = Array.from(entity.fields.values()).filter(
          f =>
            f.relation &&
            ((f.relation.ref.entity === context.entity.name &&
              f.relation.ref.field === context.field.name) ||
              ((f.relation as BelongsToMany).using &&
                (this as any).using &&
                (f.relation as BelongsToMany).using.entity ===
                  (this as any).using.entity)),
        );

        if (opposites.length > 2) {
          result.push({
            message: 'more than one possible opposite',
            result: 'error',
          });
        }

        if (opposites.length === 1) {
          context.relation.opposite = opposites[0].name;
          result.push({
            message: 'found one possible opposite. assigned.',
            result: 'fixable',
          });
        }

        if (opposites.length === 0) {
          result.push({
            message: 'no possible opposite',
            result: 'critics',
          });
        }
      }
    }
    return result;
  }
}
