import clean from '../lib/json/clean';
import { EntityReference } from './entityreference';
import { HasManyInput, HasManyStorage } from './interfaces';
import { RelationBase } from './relationbase';

export class HasMany extends RelationBase {
  protected $obj: HasManyStorage;

  get hasMany(): EntityReference {
    return this.$obj.hasMany;
  }

  get ref(): EntityReference {
    return this.$obj.hasMany;
  }

  constructor(obj: HasManyInput) {
    super(obj);
  }

  public updateWith(obj: HasManyInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };

      this.setMetadata('storage.single', false);
      this.setMetadata('storage.stored', false);
      this.setMetadata('storage.embedded', obj.embedded || false);
      this.setMetadata('verb', 'HasMany');

      let $hasMany = obj.hasMany;

      let hasMany;
      if ($hasMany) {
        hasMany = new EntityReference($hasMany);
        if (!hasMany.backField) {
          hasMany.backField = 'id';
        }
      }

      result.hasMany_ = new EntityReference($hasMany).toString();
      result.hasMany = hasMany;

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
      hasMany: props.hasMany ? props.hasMany.toString() : undefined,
    });
  }

  // it get clean object with no default values
  public toJSON(): any {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      hasMany: props.hasMany_,
    });
  }
}
