import { ElementMetaInfo, Internal } from './element';
import {
  IModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  HashToArray,
  NamedArray,
  MapToArray,
  ArrayToMap,
  IBuildable,
  IndexEntry,
  IndexValueType,
  convertIndexEntryToIndexDefinition,
  IndexEntityStore,
  convertIndexDefinitionToIndexEntry,
} from './types';

import { OperationInput, IOperation, Operation } from './operation';
import {
  FieldInput,
  IField,
  isSimpleInput,
  Field,
  isRelationFieldInput,
  isISimpleField,
  isIEntityField,
  isIRelationField,
} from './field';
import { merge } from 'lodash';
import * as inflected from 'inflected';
import { SimpleField, SimpleFieldInput } from './simplefield';
import { DEFAULT_ID_FIELD } from './definitions';
import { RelationField, RelationFieldInput } from './relationfield';
import { EntityField, EntityFieldInput } from './entityfield';
import capitalize from './lib/capitalize';
import { ObjectType } from './objecttype';

export interface IEntityBase<
  T extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence,
  I extends EntityBaseInput<T, P>,
  O extends EntityBaseOutput<T, P>
> extends IModelBase<T, I, O> {
  readonly plural: string;
  readonly titlePlural: string;
  readonly fields: Map<string, IField>;
  readonly operations: Map<string, IOperation>;
  readonly relations: Set<string>;
  readonly identity: Set<string>;
  readonly required: Set<string>;
  readonly indexed: Set<string>;
  readonly exact: boolean;
  readonly objectTypes: ObjectType[];
}

export interface EntityBasePersistence {
  indexes: IndexEntityStore;
}

export interface UIView {
  listName?: string[];
  quickSearch?: string[];
  hidden?: string[];
  edit?: string[];
  show?: string[];
  list?: string[];
  embedded?: string[];
  enum?: boolean;
  dictionary?: boolean;
}

export interface EntityBaseMetaInfoACL {
  create: string[];
  readOne: string[];
  readMany: string[];
  update: string[];
  delete: string[];
}

export interface EntityBaseMetaInfo<P extends EntityBasePersistence>
  extends ElementMetaInfo {
  titlePlural: string;
  name: {
    plural: string;
    singular: string;
  };
  persistence: P;
  UI: UIView;
  acl: EntityBaseMetaInfoACL;
}

export interface EntityBaseInternal extends ModelBaseInternal {
  fields: Map<string, IField>;
  operations: Map<string, IOperation>;
  relations: Set<string>;
  identity: Set<string>;
  required: Set<string>;
  indexed: Set<string>;
  /** not applies anything */
  exact: boolean;
  objectTypes: ObjectType[];
}

export interface EntityBaseInput<
  T extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence
> extends ModelBaseInput<T> {
  plural?: string;
  titlePlural?: string;
  operations?: AsHash<OperationInput> | NamedArray<OperationInput>;
  fields?: AsHash<FieldInput> | NamedArray<FieldInput>;
  /** not applies anything */
  exact?: boolean;
}

export interface EntityBaseOutput<
  T extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence
> extends ModelBaseOutput<T> {
  operations?: NamedArray<OperationInput>;
  fields: NamedArray<FieldInput>;
}

export const entityBaseDefaultMetaInfo = {
  name: {},
  persistence: {
    indexes: {},
  },
  UI: {
    listName: [],
    quickSearch: [],
    hidden: [],
    edit: [],
    show: [],
    list: [],
    embedded: [],
  },
  acl: {
    create: [],
    readOne: [],
    readMany: [],
    update: [],
    delete: [],
  },
};
export const entityBaseDefaultInput = {
  metadata: entityBaseDefaultMetaInfo,
  exact: false,
};

export class EntityBase<
  M extends EntityBaseMetaInfo<MP>,
  I extends EntityBaseInput<M, MP>,
  P extends EntityBaseInternal,
  MP extends EntityBasePersistence,
  O extends EntityBaseOutput<M, MP>
> extends ModelBase<M, I, P, O>
  implements IEntityBase<M, MP, I, O>, IBuildable {
  public get objectTypes(): ObjectType[] {
    return this[Internal].objectTypes;
  }
  public get modelType(): MetaModelType {
    return 'entity-base';
  }

  constructor(init: I) {
    super(merge({}, entityBaseDefaultInput, init));
  }

  get exact(): boolean {
    return this[Internal].exact;
  }

  get plural(): string {
    return this.metadata.name.plural;
  }

  get titlePlural(): string {
    return this.metadata.titlePlural;
  }

  get relations(): Set<string> {
    return this[Internal].relations;
  }

  get required(): Set<string> {
    return this[Internal].required;
  }

  get identity(): Set<string> {
    return this[Internal].identity;
  }

  get fields(): Map<string, IField> {
    return this[Internal].fields;
  }

  get operations(): Map<string, IOperation> {
    return this[Internal].operations;
  }

  get indexed(): Set<string> {
    return this[Internal].indexed;
  }

  protected mergeIndex(index: string, entry: IndexEntry) {
    const indexes = this.metadata.persistence.indexes;
    if (this.metadata.persistence.indexes.hasOwnProperty(index)) {
      const newIndex = merge({}, indexes[index], entry);
      const curIndex = indexes[index];
      if (curIndex.options && curIndex.options.unique) {
        if (!newIndex.options) {
          newIndex.options = {};
        }
        newIndex.options.unique = true;
      }
      indexes[index] = newIndex;
    } else {
      indexes[index] = entry;
    }
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<P, I, EntityBaseInput<M, MP>['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = capitalize(value.trim());
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<P, I, NonNullable<EntityBaseInput<M, MP>['exact']>>({
      src: this[Internal],
      input,
      field: 'exact',
      effect: (src, value) => {
        src.exact = value;
      },
      required: true,
      setDefault: src => (src.exact = false),
    });

    assignValue<M, I, NonNullable<EntityBaseInput<M, MP>['plural']>>({
      src: this.metadata,
      input,
      field: 'name.plural',
      inputField: 'plural',
      effect: (src, value) => {
        src.name.plural = capitalize(value.trim());
        if (src.name.plural === this.name) {
          src.name.plural = `All${this.name}`;
        }
      },
      setDefault: src => {
        src.name.plural = inflected.pluralize(this.name);
        if (src.name.plural === this.name) {
          src.name.plural = `All${this.name}`;
        }
      },
    });

    assignValue<M, I, NonNullable<EntityBaseInput<M, MP>['titlePlural']>>({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<P, I, NonNullable<EntityBaseInput<M, MP>['fields']>>({
      src: this[Internal],
      input,
      field: 'fields',
      effect: (src, value) => {
        const fields = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          (fld, order) => {
            let field: Field;
            if (isSimpleInput(fld)) {
              field = new SimpleField(
                merge({}, fld, {
                  order,
                  entity: this.name,
                } as Partial<SimpleFieldInput>),
              );
            } else if (isRelationFieldInput(fld)) {
              field = new RelationField(
                merge({}, fld, {
                  order,
                  entity: this.name,
                } as Partial<RelationFieldInput>),
              );
            } else {
              field = new EntityField(
                merge({}, fld, {
                  order,
                  entity: this.name,
                } as Partial<EntityFieldInput>),
              );
            }
            return field;
          },
          (obj: any, src: any) => obj.mergeWith(src.toObject()),
        );

        if (!this[Internal].exact) {
          let f: SimpleField;
          if (fields.has('id')) {
            f = fields.get('id') as SimpleField;
            f.updateWith({ identity: true } as Nullable<SimpleFieldInput>);
          } else if (fields.has('_id')) {
            f = fields.get('_id') as SimpleField;
            f.updateWith({ identity: true } as Nullable<SimpleFieldInput>);
          } else {
            f = new SimpleField({
              ...DEFAULT_ID_FIELD,
              entity: this.name,
              order: -1,
            });
            fields.set(f.name, f);
          }

          f.makeIdentity();
        }
        src.fields = fields;
      },
      setDefault: src =>
        (src.fields = new Map([
          [
            DEFAULT_ID_FIELD.name,
            new SimpleField({
              ...DEFAULT_ID_FIELD,
              entity: this.name,
              order: -1,
            }),
          ],
        ] as [string, SimpleField][])),
    });

    assignValue<P, I, NonNullable<EntityBaseInput<M, MP>['operations']>>({
      src: this[Internal],
      input,
      field: 'operations',
      effect: (src, value) =>
        (src.operations = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          (i, order) =>
            new Operation(merge({}, i, { entity: this.name, order })),
          (obj, src) => obj.mergeWith(src.toObject()),
        )),
      setDefault: src => (src.operations = new Map<string, Operation>()),
    });
    this.updateSummary();
  }

  public updateSummary() {
    const internal = this[Internal];
    const relations = new Set();
    const identity = new Set();
    const required = new Set();
    const indexed = new Set();

    Object.keys(this.metadata.persistence.indexes).forEach(name => {
      const index = this.metadata.persistence.indexes[name];
      const fields = Object.keys(index.fields);
      fields.forEach(f => {
        const field = this.fields.get(f);
        if (field) {
          if (!field.indexes.hasOwnProperty(index.name)) {
            field.addIndex(
              convertIndexEntryToIndexDefinition(field.name, index),
            );
          } else {
            const current = convertIndexEntryToIndexDefinition(
              field.name,
              index,
            );
            const curField = field.indexes[index.name];
            const newIndex = merge(
              {},
              curField,
              convertIndexEntryToIndexDefinition(field.name, index),
            );
            if (current.type === 'unique' || curField.type === 'unique') {
              newIndex.type = 'unique';
            }
            field.addIndex(newIndex);
          }
        }
      });
    });

    this.fields.forEach(f => {
      if (f.identity) {
        identity.add(f.name);
      }
      if (f.required) {
        required.add(f.name);
      }
      if (f.indexed) {
        indexed.add(f.name);
      }
      if (f.modelType === 'relation-field') {
        relations.add(f.name);
      }
      Object.keys(f.indexes).forEach(iName => {
        const index = f.indexes[iName];
        this.mergeIndex(
          index.name,
          convertIndexDefinitionToIndexEntry(f, index),
        );
      });
    });

    internal.relations = relations;
    internal.identity = identity;
    internal.required = required;
    internal.indexed = indexed;
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      operations: MapToArray(this.operations, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<O>);
  }

  public mergeWith(payload: Nullable<I>) {
    super.mergeWith(payload);
  }

  public build() {}
}
