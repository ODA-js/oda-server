import clean from '../lib/json/clean';
import {
  FieldArgs,
  FieldBaseInput,
  FieldBaseStorage,
  MetaModelType,
  FieldType,
} from './interfaces';
import { ModelBase } from './modelbase';
import decapitalize from './../lib/decapitalize';

export class FieldBase extends ModelBase {
  public modelType: MetaModelType = 'field';
  protected $obj: FieldBaseStorage;

  get entity(): string {
    return this.$obj.entity;
  }

  get type(): FieldType {
    return this.$obj.type;
  }

  get inheritedFrom(): string {
    return this.$obj.inheritedFrom;
  }

  get args(): FieldArgs[] {
    return this.$obj.args;
  }

  public updateWith(obj: FieldBaseInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };

      this.$obj.name = decapitalize(this.$obj.name);
      this.$obj.name_ = decapitalize(this.$obj.name_);

      let $entity = obj.entity;
      let entity = $entity;

      let args = obj.args;
      let $args = obj.args;

      let $type = obj.type;
      let type = $type || 'String';

      result.inheritedFrom = obj.inheritedFrom;

      result.type_ = $type;
      result.type = type;

      result.entity = entity;
      result.entity_ = $entity;

      result.args = args;
      result.args_ = $args;

      this.$obj = result;
    }
  }

  // it get fixed object
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      entity: props.entity || props.entity_,
      type: props.type_,
      inheritedFrom: props.inheritedFrom,
      args: props.args || props.args_,
    });
  }

  // it get clean object with no default values
  public toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      type: props.type_,
      inheritedFrom: props.inheritedFrom,
      args: props.args_,
    });
  }
}
