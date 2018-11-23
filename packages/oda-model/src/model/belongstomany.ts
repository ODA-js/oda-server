import clean from '../lib/json/clean';
import capitalize from './../lib/capitalize';
import decapitalize from './../lib/decapitalize';
import { EntityReference } from './entityreference';
import { BelongsToManyInput, BelongsToManyStorage } from './interfaces';
import { RelationBase } from './relationbase';

// http://ooad.asf.ru/standarts/UML/spr/Association_class.aspx

export class BelongsToMany extends RelationBase {
  protected $obj: BelongsToManyStorage;

  get belongsToMany(): EntityReference {
    return this.$obj.belongsToMany;
  }

  get using(): EntityReference {
    return this.$obj.using;
  }

  get ref(): EntityReference {
    return this.$obj.belongsToMany;
  }

  constructor(obj: BelongsToManyInput) {
    super(obj);
  }

  public updateWith(obj: BelongsToManyInput) {
    if (obj) {
      super.updateWith(obj);
      const result = { ...this.$obj };

      let $belongsToMany = obj.belongsToMany;
      this.setMetadata('storage.single', false);
      this.setMetadata('storage.stored', false);
      this.setMetadata('storage.embedded', obj.embedded || false);
      this.setMetadata('verb', 'BelongsToMany');

      let $using = obj.using;

      let belongsToMany;
      if ($belongsToMany) {
        belongsToMany = new EntityReference($belongsToMany);
        if (!belongsToMany.backField) {
          belongsToMany.backField = 'id';
        }
      }

      let using;
      if ($using) {
        using = new EntityReference($using);
        if (!using.$obj.field) {
          using.$obj.field = using.$obj._field = decapitalize(obj.entity);
        }
        /*
      // no need to create using Entity because items can be stored on each side this way
      } else {
        // this single end association to other
        // this.$obj.verb = 'HasMany';
        let relName = `${this.$obj.entity}${capitalize(this.$obj.field)}`;
        using = new EntityReference(
          `${obj.name || relName}#${decapitalize(obj.entity)}`,
        ); */
      }

      if (using && !using.backField) {
        using.backField = 'id';
      }

      // why? this is need
      // if (!this.$obj.name_ && using) {
      //   result.name = using.entity;
      // }

      result.belongsToMany_ = new EntityReference($belongsToMany).toString();
      result.belongsToMany = belongsToMany;

      result.using_ = $using;
      result.using = using;

      this.$obj = result;
      this.initNames();
    }
  }
  // it get fixed object
  public toObject(): any {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      belongsToMany: props.belongsToMany
        ? props.belongsToMany.toString()
        : undefined,
      using: props.using ? props.using.toString() : undefined,
    });
  }

  // it get clean object with no default values
  public toJSON(): any {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      belongsToMany: props.belongsToMany_,
      using: props.using_,
    });
  }
}
