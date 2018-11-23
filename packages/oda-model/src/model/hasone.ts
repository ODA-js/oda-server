import clean from '../lib/json/clean';
import { EntityReference } from './entityreference';
import { HasOneInput, HasOneStorage } from './interfaces';
import { RelationBase } from './relationbase';

export class HasOne extends RelationBase {
  protected $obj: HasOneStorage;

  get hasOne(): EntityReference {
    return this.$obj.hasOne;
  }

  get ref(): EntityReference {
    return this.$obj.hasOne;
  }

  constructor(obj: HasOneInput) {
    super(obj);
  }

  public updateWith(obj: HasOneInput) {
    if (obj) {
      super.updateWith(obj);
      const result = { ...this.$obj };

      this.setMetadata('storage.single', true);
      this.setMetadata('storage.stored', false);
      this.setMetadata('storage.embedded', obj.embedded || false);
      this.setMetadata('verb', 'HasOne');

      let $hasOne = obj.hasOne;

      let hasOne;
      if ($hasOne) {
        hasOne = new EntityReference($hasOne);
        if (!hasOne.backField) {
          hasOne.backField = 'id';
        }
      }

      result.hasOne_ = new EntityReference($hasOne).toString();
      result.hasOne = hasOne;

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
      hasOne: props.hasOne ? props.hasOne.toString() : undefined,
    });
  }

  // it get clean object with no default values
  public toJSON(): any {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      hasOne: props.hasOne_,
    });
  }
}
