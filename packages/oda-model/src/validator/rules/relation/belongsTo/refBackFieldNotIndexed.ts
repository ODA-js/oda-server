import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-belongsTo-ref-backFielnd-not-indexed-fix';
  public description = 'back field not indexed. fixed.';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.ref.backField) {
      const bf = context.entity.fields.get(context.relation.ref.backField);
      if (bf && !bf.indexed) {
        const update = bf.toJSON();
        update.indexed = true;
        update.entity = context.entity.name;
        bf.updateWith(update);
        result.push({
          message: this.description,
          result: 'error',
        });
      }
    }
    return result;
  }
}
