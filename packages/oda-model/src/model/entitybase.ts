import * as inflected from 'inflected';

import clean from '../lib/json/clean';
import deepMerge from './../lib/json/deepMerge';
import { DEFAULT_ID_FIELD } from './definitions';
import { Field } from './field';
import {
  EntityInput,
  FieldInput,
  MetaModelType,
  EntityBaseStorage,
  EntityBaseInput,
  IEntityBase,
  EntityBaseJSON,
  OperationInput,
} from './interfaces';
import { ModelBase } from './modelbase';
import { ModelPackage } from './modelpackage';
import { Operation } from './operation';
import { timesSeries } from 'async';

/**
 * 1. тип объекта который входит на updateWith
 * 2. тип объекта который идет на toObject
 * 3. тип объекта который идет на toJSON
 * 3. тип объекта который идет на выходе clone
 */

export class EntityBase extends ModelBase implements IEntityBase {
  public modelType: MetaModelType = 'entitybase';

  protected $obj: EntityBaseStorage;

  constructor(obj: EntityBaseInput) {
    super(obj);
  }

  public ensureIds(modelPackage: ModelPackage) {
    this.identity.forEach(value => {
      let ids = this.fields.get(value);
      if (ids) {
        modelPackage.identityFields.set(ids.idKey.toString(), this);
      }
    });
  }

  public ensureFKs(modelPackage: ModelPackage) {
    if (modelPackage) {
      let modelRelations;
      if (modelPackage.relations.has(this.name)) {
        modelRelations = modelPackage.relations.get(this.name);
      } else {
        modelRelations = new Map();
        modelPackage.relations.set(this.name, modelRelations);
      }

      if (modelRelations) {
        this.relations.forEach(value => {
          let ref = this.fields.get(value);
          // must be different to apply fixup
          if (ref && modelRelations) {
            modelRelations.set(ref.name, ref.clone());
          }
        });
      }
    }
  }

  public removeIds(modelPackage: ModelPackage) {
    this.identity.forEach(value => {
      let ids = this.fields.get(value);
      if (ids) {
        modelPackage.identityFields.delete(ids.idKey.toString());
      }
    });
  }

  get plural(): string {
    return this.getMetadata('name.plural');
  }

  get titlePlural(): string {
    return this.getMetadata('titlePlural');
  }

  get relations(): Set<string> {
    return this.$obj.relations;
  }

  get required(): Set<string> {
    return this.$obj.required;
  }

  get identity(): Set<string> {
    return this.$obj.identity;
  }

  get fields(): Map<string, Field> {
    return this.$obj.fields;
  }

  get operations(): Map<string, Operation> {
    return this.$obj.operations;
  }

  get indexed(): Set<string> {
    return this.$obj.indexed;
  }

  protected updateIndex(f: Field) {
    let indexes = this.getMetadata('storage.indexes', {});
    if (f.indexed) {
      let indexName: string | string[];
      if (typeof f.indexed === 'boolean') {
        indexName = f.name;
      } else if (Array.isArray(f.indexed)) {
        indexName = f.indexed;
      } else if (typeof f.indexed === 'string') {
        indexName = f.indexed.split(' ');
        indexName = indexName.length > 1 ? indexName : indexName[0];
      }
      let entry = {
        name: indexName,
        fields: {
          [f.name]: 1,
        },
        options: {
          sparse: true,
        },
      };
      if (typeof indexName === 'string') {
        this.mergeIndex(indexes, indexName, entry);
      } else {
        for (let i = 0, len = indexName.length; i < len; i++) {
          let index = indexName[i];
          this.mergeIndex(indexes, index, entry);
        }
      }
    }
  }

  protected updateUniqueIndex(f: Field) {
    let indexes = this.getMetadata('storage.indexes', {});
    if (f.identity) {
      let indexName: string | string[];
      if (typeof f.identity === 'boolean') {
        indexName = f.name;
      } else if (Array.isArray(f.identity)) {
        indexName = f.identity;
      } else if (typeof f.identity === 'string') {
        indexName = f.identity.split(' ');
        indexName = indexName.length > 1 ? indexName : indexName[0];
      }
      let entry = {
        name: indexName,
        fields: {
          [f.name]: 1,
        },
        options: {
          sparse: true,
          unique: true,
        },
      };
      if (typeof indexName === 'string') {
        this.mergeIndex(indexes, indexName, entry);
      } else {
        for (let i = 0, len = indexName.length; i < len; i++) {
          let index = indexName[i];
          this.mergeIndex(indexes, index, entry);
        }
      }
    }
  }

  protected mergeIndex(indexes: any, index: string, entry: any) {
    if (indexes.hasOwnProperty(index)) {
      indexes[index] = deepMerge(indexes[index], entry);
      if (Array.isArray(indexes[index].name)) {
        indexes[index].name = indexes[index].name[0];
      } else {
        indexes[index].name = indexes[index].name;
      }
    } else {
      indexes[index] = entry;
    }
  }

  public updateWith(obj: EntityInput) {
    if (obj) {
      super.updateWith(obj);

      const result = { ...this.$obj };
      result.name =
        this.getMetadata('name.singular') || inflected.classify(result.name);

      if (obj.titlePlural) {
        this.setMetadata('titlePlural', obj.titlePlural);
      }

      let $plural = obj.plural || this.getMetadata('name.plural');
      if (!$plural) {
        $plural = inflected.pluralize(result.name);
      }

      if (!this.getMetadata('titlePlural')) {
        this.setMetadata('titlePlural', $plural);
      }

      this.setMetadata('name.singular', result.name);
      this.setMetadata('name.plural', $plural);

      result.name =
        result.name.slice(0, 1).toUpperCase() + result.name.slice(1);

      const fields = new Map<string, Field>();
      const operations = new Map<string, Operation>();
      const relations = new Set();
      const identity = new Set();
      const required = new Set();
      const indexed = new Set();

      let traverse = (fld, index) => {
        let field = new Field({
          ...(fld.toJSON ? fld.toJSON() : fld),
          metadata: {
            order: index,
            ...fld.metadata,
          },
          entity: result.name,
        });

        if (fields.has(field.name)) {
          throw new Error(
            `the same field ${field.name} is already exists in ${
              obj.name
            } entry`,
          );
        }

        fields.set(field.name, field);

        if (field.identity) {
          identity.add(field.name);
          this.updateUniqueIndex(field);
        }

        if (field.required) {
          required.add(field.name);
        }

        if (field.relation) {
          relations.add(field.name);
        }

        if (field.indexed) {
          indexed.add(field.name);
          this.updateIndex(field);
        }
      };

      const opTraverse = (op: OperationInput | Operation, index: Number) => {
        const operation = new Operation({
          ...(op.hasOwnProperty('toJSON') ? (op as Operation).toJSON() : op),
          metadata: {
            order: index,
            ...op.metadata,
          },
          entity: result.name,
        });
        if (fields.has(operation.name)) {
          throw new Error(
            `the same field ${operation.name} is already exists in ${
              obj.name
            } entry`,
          );
        }
        operations.set(operation.name, operation);
      };

      if (Array.isArray(obj.fields)) {
        (obj.fields as FieldInput[]).forEach(traverse);
      } else {
        let fieldNames = Object.keys(obj.fields);
        for (let i = 0, len = fieldNames.length; i < len; i++) {
          let fName = fieldNames[i];
          traverse({ ...obj.fields[fName], name: fName }, i);
        }
      }

      if (Array.isArray(obj.operations)) {
        (obj.operations as FieldInput[]).forEach(opTraverse);
      } else if (obj.operations) {
        let opName = Object.keys(obj.operations);
        for (let i = 0, len = opName.length; i < len; i++) {
          let fName = opName[i];
          opTraverse({ ...obj.operations[fName], name: fName }, i);
        }
      }

      // if (identity.size === 0) {
      // ensure Id property
      let f;
      if (fields.has('id')) {
        f = fields.get('id');
      } else if (!f && fields.has('_id')) {
        f = fields.get('_id');
      } else {
        f = new Field({ ...DEFAULT_ID_FIELD, entity: result.name });
        fields.set(f.name, f);
      }

      if (f) {
        f.makeIdentity();
        indexed.add(f.name);
        identity.add(f.name);
        required.add(f.name);
      }
      // }

      result.relations = relations;
      result.identity = identity;
      result.required = required;
      result.indexed = indexed;
      result.fields = fields;
      result.operations = operations;
      this.$obj = result;
    }
  }

  public ensureIndexes() {
    this.setMetadata('storage.indexes', {});
    this.fields.forEach(f => {
      if (f.identity) {
        this.updateUniqueIndex(f);
      } else if (f.indexed) {
        this.updateIndex(f);
      }
    });
  }

  public toObject(modelPackage?: ModelPackage) {
    if (!modelPackage) {
      let props = this.$obj;
      let res = super.toObject();
      return clean({
        ...res,
        fields: [...Array.from(props.fields.values())].map(f => f.toObject()),
        operations: [...Array.from(props.operations.values())].map(f =>
          f.toObject(),
        ),
      });
    } else {
      let modelRelations = modelPackage.relations.get(this.name);
      if (modelRelations) {
        let props = this.$obj;
        let res = super.toObject();
        return clean({
          ...res,
          operations: [...Array.from(props.operations.values())],
          fields: [...Array.from(props.fields.values())]
            .map(f => {
              let result;
              if (this.relations.has(f.name)) {
                if (modelRelations && modelRelations.has(f.name)) {
                  result = f.toObject(modelPackage);
                }
              } else {
                result = f.toObject(modelPackage);
              }
              return result;
            })
            .filter(f => f),
        });
      }
    }
  }

  public toJSON(modelPackage?: ModelPackage): EntityBaseJSON | undefined {
    if (!modelPackage) {
      let props = this.$obj;
      let res = super.toJSON();
      return clean({
        ...res,
        fields: [...Array.from(props.fields.values())],
        operations: [...Array.from(props.operations.values())],
      }) as any;
    } else {
      let modelRelations = modelPackage.relations.get(this.name);
      if (modelRelations) {
        let props = this.$obj;
        let res = super.toJSON();
        return clean({
          ...res,
          fields: [...Array.from(props.fields.values())]
            .map(f => {
              let result;
              if (this.relations.has(f.name)) {
                if (modelRelations && modelRelations.has(f.name)) {
                  result = f.toJSON(modelPackage);
                }
              } else {
                result = f.toJSON(modelPackage);
              }
              return result;
            })
            .filter(f => f),
          operations: [...Array.from(props.operations.values())],
        });
      }
    }
  }
}
