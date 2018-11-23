import { Entity } from '../../../../entity';
import { IValidationResult } from '../../../../interfaces';
import { ModelPackage } from '../../../../modelpackage';
import { IRelationContext } from '../../../interfaces';
import { Rule } from '../../../rules';

export default class implements Rule<IRelationContext> {
  public name = 'relation-btm-using-entity-not-found';
  public description = 'using entity not found';
  public validate(context: IRelationContext): IValidationResult[] {
    const result: IValidationResult[] = [];
    if (context.relation.using) {
      const entity = context.package.entities.get(
        context.relation.using.entity,
      );
      if (
        !entity &&
        context.model &&
        context.model.packages &&
        context.model.packages.has('system')
      ) {
        const pack: any = context.model.packages.get('system');
        const sysEntity =
          pack && pack.entities.get(context.relation.using.entity);
        if (sysEntity) {
          (<ModelPackage>context.package).addEntity(<Entity>sysEntity);
          result.push({
            message: 'using entity resolved from system package',
            result: 'fixable',
          });
        } else {
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
