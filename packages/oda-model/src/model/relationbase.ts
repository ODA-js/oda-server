import * as inflected from 'inflected';

import clean from '../lib/json/clean';
import fold from './../lib/json/fold';
import { EntityReference } from './entityreference';
import { Field } from './index';
import {
  IRelation,
  IValidationResult,
  IValidator,
  MetaModelType,
  RelationBaseInput,
  RelationBaseJSON,
  RelationBaseStorage,
  RelationType,
} from './interfaces';
import { Metadata } from './metadata';
import decapitalize from '../lib/decapitalize';

export class RelationBase extends Metadata implements IRelation {
  public get modelType(): MetaModelType {
    return this.verb;
  }
  /**
   * represents internal object storage
   */
  protected $obj!: RelationBaseStorage;
  public validate(validator: IValidator): IValidationResult[] {
    return validator.check(this);
  }
  /**
   * construct object
   */
  constructor(obj: RelationBaseInput) {
    super(obj);
    if (obj) {
      this.updateWith(fold(obj) as RelationBaseInput);
    }
  }

  get name(): string {
    return this.$obj.name || '';
  }

  get field(): string {
    return this.$obj.field;
  }

  get entity(): string {
    return this.$obj.entity;
  }

  get fields(): Map<string, Field> | undefined {
    return this.$obj.fields;
  }

  get ref(): EntityReference {
    return new EntityReference({ entity: '', field: '', backField: '' });
  }

  get verb(): RelationType {
    return this.getMetadata('verb');
  }

  // one item per relation
  get single() {
    return this.getMetadata('storage.single');
  }

  // key is storage is located in owner side of entity
  get stored() {
    return this.getMetadata('storage.stored');
  }

  // stored as members of class
  get embedded() {
    return this.getMetadata('storage.embedded');
  }

  // opposite entity field with relation def
  get opposite() {
    return this.$obj.opposite;
  }

  set opposite(val) {
    this.$obj.opposite = val;
  }

  protected initNames() {
    let ref = this.single
      ? inflected.singularize(this.$obj.field)
      : inflected.pluralize(this.$obj.field);
    this.getMetadata(
      'name.full',
      this.name ||
        `${this.$obj.entity}${this.verb}${inflected.camelize(ref, true)}`,
    );

    let ref1 = this.single
      ? inflected.singularize(this.$obj.field)
      : inflected.pluralize(this.$obj.field);
    this.setMetadata(
      'name.normal',
      `${this.$obj.entity}${inflected.camelize(ref1, true)}`,
    );

    let ref2 = this.single
      ? inflected.singularize(this.$obj.field)
      : inflected.pluralize(this.$obj.field);
    this.getMetadata('name.short', `${inflected.camelize(ref2, true)}`);
  }

  get fullName() {
    let result = this.getMetadata('name.full');
    if (!result) {
      this.initNames();
      result = this.getMetadata('name.full');
    }
    return result;
  }

  get normalName() {
    let result = this.getMetadata('name.normal');
    if (!result) {
      this.initNames();
      result = this.getMetadata('name.normal');
    }
    return result;
  }

  get shortName() {
    let result = this.getMetadata('name.short');
    if (!result) {
      this.initNames();
      result = this.getMetadata('name.short');
    }
    return result;
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public toObject(): RelationBaseInput {
    let props = this.$obj;
    return clean({
      ...super.toObject(),
      name: props.name || props.name_,
      entity: props.entity,
      field: props.field,
      fields: props.fields && Array.from(props.fields.values()),
      opposite: props.opposite,
      embedded: this.embedded || undefined,
    });
  }

  public updateWith(obj: RelationBaseInput): void {
    if (obj) {
      const result: RelationBaseStorage = { ...this.$obj };

      let $name = obj.name;
      let opposite = obj.opposite && decapitalize(obj.opposite);

      let name = $name ? inflected.camelize($name.trim()) : $name;

      result.name = name;

      result.opposite = opposite;
      if (obj.fields) {
        result.fields = new Map<string, Field>();
        if (Array.isArray(obj.fields)) {
          obj.fields.forEach(f => {
            result.fields.set(f.name, new Field(f));
          });
        } else if (obj.fields) {
          Object.keys(obj.fields).forEach(f => {
            result.fields.set(
              f,
              new Field({
                name: f,
                ...(obj as any).fields[f],
              }),
            );
          });
        }
      }

      let $entity = obj.entity;
      let entity = $entity;

      let $field = obj.field;
      let field = $field;

      result.entity = entity;

      result.field = field;

      this.$obj = result;
    }
  }
}
