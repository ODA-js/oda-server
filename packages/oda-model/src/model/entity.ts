import clean from '../lib/json/clean';
import { Field } from './field';
import {
  EntityInput,
  EntityJSON,
  EntityStorage,
  IEntity,
  MetaModelType,
} from './interfaces';
import { ModelPackage } from './modelpackage';
import { EntityBase } from './entitybase';

/**
 * 1. тип объекта который входит на updateWith
 * 2. тип объекта который идет на toObject
 * 3. тип объекта который идет на toJSON
 * 3. тип объекта который идет на выходе clone
 */

export class Entity extends EntityBase implements IEntity {
  public modelType: MetaModelType = 'entity';

  protected $obj!: EntityStorage;

  constructor(obj: EntityInput) {
    super(obj);
  }

  get implements(): Set<string> {
    return this.$obj.implements;
  }

  get abstract(): boolean {
    return !!this.$obj.abstract;
  }

  get embedded(): boolean | string[] {
    return this.$obj.embedded instanceof Set
      ? Array.from(this.$obj.embedded)
      : this.$obj.embedded;
  }

  public ensureImplementation(modelPackage: ModelPackage) {
    const newFields: Map<string, Field> = new Map<string, Field>();
    this.implements.forEach(intrf => {
      if (modelPackage.mixins.has(intrf)) {
        const impl = modelPackage.mixins.get(intrf);
        impl.fields.forEach(f => {
          if (!this.fields.has(f.name)) {
            newFields.set(f.name, f);
          }
        });
      }
    });

    if (newFields.size > 0) {
      const update = this.toJSON();
      update.fields.push(...[...newFields.values()].map(f => f.toJSON()));
      this.updateWith(update);
      this.ensureIds(modelPackage);
    }
  }

  public updateWith(obj: EntityInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };
      const impl = new Set(obj.implements);
      result.embedded = Array.isArray(obj.embedded)
        ? new Set(obj.embedded)
        : obj.embedded;
      result.abstract = obj.abstract;
      result.implements = impl;
      this.$obj = result;
    }
  }

  public toObject(modelPackage?: ModelPackage) {
    if (!modelPackage) {
      let res = super.toObject();
      return clean({
        ...res,
        implements: [...this.implements],
        embedded: this.embedded,
        abstract: this.abstract,
      });
    } else {
      let modelRelations = modelPackage.relations.get(this.name);
      if (modelRelations) {
        let res = super.toObject();
        return clean({
          ...res,
          embedded: this.embedded,
          abstract: this.abstract,
          implements: [...this.implements].filter(i =>
            modelPackage.mixins.has(i),
          ),
        });
      }
    }
  }
}
