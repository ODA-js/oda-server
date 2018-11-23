import clean from '../lib/json/clean';
import { BelongsTo } from './belongsto';
import { BelongsToMany } from './belongstomany';
import { EntityReference } from './entityreference';
import { FieldBase } from './fieldbase';
import { HasMany } from './hasmany';
import { HasOne } from './hasone';
import { FieldInput, FieldStorage, IField, FieldType } from './interfaces';
import { ModelPackage } from './modelpackage';
import { RelationBase } from './relationbase';

function discoverFieldType(obj) {
  // сделать проверку по полю...
  if (obj.hasOne) {
    return 'HasOne';
  } else if (obj.hasMany) {
    return 'HasMany';
  } else if (obj.belongsTo) {
    return 'BelongsTo';
  } else if (obj.belongsToMany) {
    return 'BelongsToMany';
  } else {
    console.warn(`undefined relation type of ${JSON.stringify(obj)}`);
    return 'undefined';
  }
}

export class Field extends FieldBase implements IField {
  protected $obj: FieldStorage;
  constructor(obj: FieldInput) {
    super(obj);
  }

  // is used with custom resolver
  get derived() {
    return this.getMetadata('storage.derived');
  }

  // is retrieved from storage layer
  get persistent() {
    return this.getMetadata('storage.persistent');
  }

  get defaultValue() {
    return this.getMetadata('defaultValue');
  }

  // wheather the field is List of Items i.e. String[]
  get list(): boolean {
    return this.$obj.list;
  }

  get map(): boolean {
    return this.$obj.map;
  }

  get identity(): boolean | string | string[] {
    return this.getMetadata('storage.identity');
  }

  // this is to make sure that if we internally set
  public makeIdentity() {
    this.$obj.idKey = new EntityReference(
      this.$obj.entity,
      this.$obj.name,
      'id',
    );
    this.setMetadata('storage.identity', true);
    this.setMetadata('storage.indexed', true);
    this.setMetadata('storage.required', true);
  }

  get required(): boolean {
    return this.getMetadata('storage.required');
  }

  get indexed(): boolean | string | string[] {
    return this.getMetadata('storage.indexed');
  }

  get idKey(): EntityReference {
    return this.$obj.idKey;
  }

  get order(): string {
    return this.getMetadata('order');
  }

  get relation(): RelationBase {
    return this.$obj.relation;
  }

  set relation(value: RelationBase) {
    this.$obj.relation = value;
  }

  public getRefType(pkg: ModelPackage): FieldType | void {
    if (this.relation) {
      let ref = this.relation.ref;
      let link = ref.toString();
      if (pkg.identityFields.has(link)) {
        let entity = pkg.identityFields.get(link);
        if (entity.fields.has(ref.field)) {
          return entity.fields.get(ref.field).type;
        }
      }
    }
  }

  public clone() {
    return new (<typeof Field>this.constructor)(this.toObject());
  }

  public updateWith(obj: FieldInput) {
    if (obj) {
      super.updateWith(obj);
      const result = { ...this.$obj };

      result.map = obj.map || result.map || false;
      result.list = obj.list || result.list || false;

      // wheather it is explicitly defined or has arguments

      this.setMetadata(
        'storage.derived',
        obj.derived ||
          (Array.isArray(obj.args) && obj.args.length > 0) ||
          this.getMetadata('storage.derived'),
      );
      this.setMetadata(
        'storage.persistent',
        obj.persistent ||
          !(
            obj.derived ||
            this.getMetadata('storage.derived') ||
            (Array.isArray(obj.args) && obj.args.length > 0)
          ),
      );

      if (obj.defaultValue && !this.derived) {
        this.setMetadata('defaultValue', obj.defaultValue);
      }

      this.setMetadata('storage.identity', obj.identity);

      this.setMetadata(
        'storage.required',
        obj.required || (obj.identity && obj.required !== false),
      );

      this.setMetadata('storage.indexed', obj.indexed || obj.identity);

      if (this.getMetadata('storage.identity', false)) {
        // это то как выглядит ключ для внешних ссылок
        result.idKey = new EntityReference(result.entity, result.name, 'id');
      }

      // identity can't have relation definition
      // why? because! we need to support existing code.
      const isIdentity = this.getMetadata('storage.identity', false);

      if (isIdentity || obj.relation) {
        this.setMetadata('defaultValue', undefined);
      }

      if (typeof obj.type === 'object') {
        if (obj.type.type === 'entity') {
          const type = obj.type;
          let relation: HasMany | HasOne;
          switch (type.multiplicity) {
            case 'one': {
              relation = new HasOne({
                hasOne: `${type.name}#`,
                entity: obj.entity,
                field: obj.name,
                embedded: true,
              });
              break;
            }
            case 'many': {
              relation = new HasMany({
                hasMany: `${type.name}#`,
                entity: obj.entity,
                field: obj.name,
                embedded: true,
              });
              break;
            }
            default:
          }
          result.relation = relation;
        }
      } else if (obj.relation && !isIdentity) {
        let $relation = obj.relation;
        let relation: RelationBase;

        switch (discoverFieldType($relation)) {
          case 'HasOne':
            relation = new HasOne({
              ...($relation as { hasOne: string }),
              entity: obj.entity,
              field: obj.name,
            });
            break;
          case 'HasMany':
            relation = new HasMany({
              ...($relation as { hasMany: string }),
              entity: obj.entity,
              field: obj.name,
            });
            break;
          case 'BelongsToMany':
            relation = new BelongsToMany({
              ...($relation as { belongsToMany: string; using: string }),
              entity: obj.entity,
              field: obj.name,
            });
            break;
          case 'BelongsTo':
            relation = new BelongsTo({
              ...($relation as { belongsTo: string }),
              entity: obj.entity,
              field: obj.name,
            });
            break;
          default:
            throw new Error('undefined type');
        }
        result.map = false;
        result.list = false;

        result.relation = relation;
        delete result.type_;
        delete result.type;
      }

      this.$obj = result;
    }
  }

  // it get fixed object
  public toObject(modelPackage?: ModelPackage): any {
    let props = this.$obj;
    let res = super.toObject();
    return clean({
      ...res,
      derived: this.derived,
      defaultValue: this.defaultValue,
      persistent: this.persistent,
      entity: props.entity,
      type: props.type || props.type_,
      inheritedFrom: props.inheritedFrom,
      list: props.list,
      map: props.map,
      idKey: props.idKey ? props.idKey.toString() : undefined,
      relation: props.relation ? props.relation.toObject() : undefined,
    });
  }

  // it get clean object with no default values
  public toJSON(modelPackage?: ModelPackage): FieldInput {
    let props = this.$obj;
    let res = super.toJSON();
    return clean({
      ...res,
      derived: this.derived,
      defaultValue: this.defaultValue,
      persistent: this.persistent,
      list: props.list,
      map: props.map,
      relation: props.relation ? props.relation.toJSON() : undefined,
    });
  }
}
