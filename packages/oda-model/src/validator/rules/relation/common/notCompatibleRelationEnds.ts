import { IValidationResult } from '../../../../interfaces';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-common-not-supported-opposite';
  public description = 'relation has unsupported opposite';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.opposite) {
      const entity = context.package.entities.get(context.relation.ref.entity);
      if (entity && entity.fields.has(context.relation.opposite)) {
        const opposite = entity.fields.get(context.relation.opposite);
        if (
          opposite &&
          opposite.relation &&
          opposite.relation.verb &&
          context.relation &&
          context.relation.verb &&
          opposits.hasOwnProperty(context.relation.verb) &&
          !opposits[context.relation.verb][opposite.relation.verb]
        ) {
          result.push({
            message: this.description,
            result: 'error',
          });
        }
      }
    }
    return result;
  }
}

// проверять на вычисляемые поля, они могут быть какими угодно....

const opposits: { [key: string]: any } = {
  BelongsTo: {
    HasOne: true,
    HasMany: true,
  },
  BelongsToMany: {
    BelongsToMany: true,
  },
  HasMany: {
    BelongsTo: true,
  },
  HasOne: {
    BelongsTo: true,
  },
};
