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
  mergeStringArray,
} from './field';
import { merge } from 'lodash';
import * as inflected from 'inflected';
import { SimpleField, SimpleFieldInput } from './simplefield';
import { DEFAULT_ID_FIELD } from './definitions';
import { RelationField, RelationFieldInput } from './relationfield';
import { EntityField, EntityFieldInput } from './entityfield';
import capitalize from './lib/capitalize';

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
}

export interface IndexEntry {
  name: string;
  fields: { [field: string]: number };
  options: { sparse: boolean; unique: boolean };
}

export interface IndexEntryOptions {
  sparse?: boolean;
  unique?: boolean;
}

export interface EntityBasePersistence {
  indexes: {
    [index: string]: IndexEntry;
  };
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
> extends ModelBase<M, I, P, O> implements IEntityBase<M, MP, I, O> {
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

  protected updateIndex(f: IField, options: IndexEntryOptions) {
    let indexName: string | string[];
    const key: 'indexed' | 'identity' = options.unique ? 'identity' : 'indexed';

    if (typeof f[key] === 'boolean') {
      indexName = f.name;
    } else if (Array.isArray(f[key])) {
      indexName = f[key] as string[];
    } else {
      indexName = (f[key] as string).split(' ');
      indexName = indexName.length > 1 ? indexName : indexName[0];
    }
    let entry = {
      fields: {
        [f.name]: 1,
      },
      options,
    };
    if (typeof indexName === 'string') {
      this.mergeIndex(indexName, { name: indexName, ...entry });
    } else {
      indexName.forEach(index => {
        this.mergeIndex(index, { name: index, ...entry });
      });
    }
  }

  protected mergeIndex(index: string, entry: any) {
    const indexes = this.metadata.persistence.indexes;
    if (this.metadata.persistence.indexes.hasOwnProperty(index)) {
      indexes[index] = merge(indexes[index], entry);
      indexes[index].name = indexes[index].name;
    } else {
      indexes[index] = entry;
    }
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<P, I, I['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = capitalize(value.trim());
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<P, I, NonNullable<I['exact']>>({
      src: this[Internal],
      input,
      field: 'exact',
      effect: (src, value) => {
        src.exact = value;
      },
      required: true,
      setDefault: src => (src.exact = false),
    });

    assignValue<M, I, string>({
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

    assignValue<M, I, NonNullable<I['titlePlural']>>({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<P, I, NonNullable<I['fields']>>({
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
              if (field.identity) {
                this.updateIndex(field, { unique: true, sparse: true });
              }

              if (field.indexed) {
                this.updateIndex(field, { sparse: true });
              }
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
            this.updateIndex(f, { unique: true });
          } else if (fields.has('_id')) {
            f = fields.get('_id') as SimpleField;
            f.updateWith({ identity: true } as Nullable<SimpleFieldInput>);
            this.updateIndex(f, { unique: true });
          } else {
            f = new SimpleField({
              ...DEFAULT_ID_FIELD,
              entity: this.name,
              order: -1,
            });
            fields.set(f.name, f);
            this.updateIndex(f, { unique: true });
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

    assignValue<P, I, NonNullable<I['operations']>>({
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

    const initialized = {
      identity: new Set<string>(),
      indexed: new Set<string>(),
    };

    Object.keys(this.metadata.persistence.indexes).forEach(name => {
      const index = this.metadata.persistence.indexes[name];
      const fields = Object.keys(index.fields);
      const isUnique = index.options.unique;
      const indexType = isUnique ? 'identity' : 'indexed';
      fields.forEach(f => {
        const field = this.fields.get(f);
        if (field) {
          const res = field.toObject();
          let value: string[];
          if (initialized[indexType].has(field.name)) {
            const indexed = res[indexType] as string[];
            value = mergeStringArray(indexed, index.name);
          } else {
            value = [index.name];
            initialized[indexType].add(field.name);
          }

          updateFieldWithIndex(field, indexType, value);
        }
      });
    });

    this.fields.forEach(f => {
      if (f.identity) {
        if (Array.isArray(f.identity) && f.identity.length === 1) {
          if (f.identity[0] === f.name) {
            updateFieldWithIndex(f, 'identity', true);
          } else {
            updateFieldWithIndex(f, 'identity', f.identity[0]);
          }
        }
        identity.add(f.name);
      }
      if (f.required) {
        required.add(f.name);
      }
      if (f.indexed) {
        if (Array.isArray(f.indexed) && f.indexed.length === 1) {
          if (f.indexed[0] === f.name) {
            updateFieldWithIndex(f, 'indexed', true);
          } else {
            updateFieldWithIndex(f, 'indexed', f.indexed[0]);
          }
        }
        indexed.add(f.name);
      }
      if (f.indexed === f.identity) {
        updateFieldWithIndex(f, 'indexed', true);
      }
      if (f.modelType === 'relation-field') {
        relations.add(f.name);
      }
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
}

function updateFieldWithIndex(
  field: IField,
  indexType: string,
  value: string[] | string | boolean,
) {
  if (isISimpleField(field)) {
    field.updateWith({
      [indexType]: value,
    } as any);
  } else if (isIEntityField(field)) {
    field.updateWith({
      [indexType]: value,
    } as any);
  } else if (
    isIRelationField(field) &&
    field.relation.modelType === 'BelongsTo'
  ) {
    field.updateWith({
      [indexType]: value,
    } as any);
  }
}
