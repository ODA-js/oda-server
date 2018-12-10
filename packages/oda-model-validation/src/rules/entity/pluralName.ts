import { IValidationResultEntity } from 'packages/oda-model/src/validation';
import { IEntityContext } from '../../interfaces';
import { Rule } from '../../rules';

export default class implements Rule<IEntityContext> {
  public name = 'entity-plural-name-the-same';
  public description =
    'plural form of entity`s name of entity must be different from its singular form';
  public validate(context: IEntityContext): Partial<IValidationResultEntity>[] {
    const result: Partial<IValidationResultEntity>[] = [];
    if (context.entity.name === context.entity.plural) {
      result.push({
        entity: context.entity.name,
        message: this.description,
        result: 'error',
      });
    }
    return result;
  }
}
