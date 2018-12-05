import { ElementMetaInfo } from './element';
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
  MapToHash,
  NamedArray,
  MapToArray,
} from './model';
import { OperationInput, IOperation, Operation } from './operation';
import {
  FieldInput,
  IField,
  isSimpleInput,
  Field,
  isRelationFieldInput,
} from './field';
import { merge } from 'lodash';
import * as inflected from 'inflected';
import { SimpleField, SimpleFieldInput } from './simplefield';
import { DEFAULT_ID_FIELD } from './definitions';
import { RelationField, RelationFieldInput } from './relationfield';
import { EntityField, EntityFieldInput } from './entityfield';

export interface IEntityBase<
  T extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence,
  I extends EntityBaseInput<T, P>,
  O extends EntityBaseOutput<T, P>
> extends IModelBase<T, I, O> {
  plural: string;
  titlePlural: string;
  fields: Map<string, IField>;
  operations: Map<string, IOperation>;
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

export interface EntityBaseMetaInfo<P extends EntityBasePersistence>
  extends ElementMetaInfo {
  titlePlural: string;
  name: {
    plural: string;
    singular: string;
  };
  persistence: P;
}

export interface EntityBaseInternal<
  M extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence
> extends ModelBaseInternal<M> {
  fields: Map<string, IField>;
  operations: Map<string, IOperation>;
  relations: Set<string>;
  identity: Set<string>;
  required: Set<string>;
  indexed: Set<string>;
}

export interface EntityBaseInput<
  T extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence
> extends ModelBaseInput<T> {
  plural?: string;
  titlePlural?: string;
  operations?: AsHash<OperationInput> | NamedArray<OperationInput>;
  fields: AsHash<FieldInput> | NamedArray<FieldInput>;
}

export interface EntityBaseOutput<
  T extends EntityBaseMetaInfo<P>,
  P extends EntityBasePersistence
> extends ModelBaseOutput<T> {
  plural?: string;
  titlePlural?: string;
  operations?: NamedArray<OperationInput>;
  fields: NamedArray<FieldInput>;
}

const defaultMetaInfo = { name: {}, persistence: {} };
const defaultInternal = {};
const defaultInput = {};

export abstract class EntityBase<
  M extends EntityBaseMetaInfo<MP>,
  I extends EntityBaseInput<M, MP>,
  P extends EntityBaseInternal<M, MP>,
  MP extends EntityBasePersistence,
  O extends EntityBaseOutput<M, MP>
> extends ModelBase<M, I, P, O> implements IEntityBase<M, MP, I, O> {
  public modelType: MetaModelType = 'entity-base';

  constructor(inp: I) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  // public ensureIds(modelPackage: ModelPackage) {
  //   this.identity.forEach(value => {
  //     let ids = this.fields.get(value);
  //     if (ids) {
  //       modelPackage.identityFields.set(ids.idKey.toString(), this);
  //     }
  //   });
  // }

  // public ensureFKs(modelPackage: ModelPackage) {
  //   if (modelPackage) {
  //     let modelRelations;
  //     if (modelPackage.relations.has(this.name)) {
  //       modelRelations = modelPackage.relations.get(this.name);
  //     } else {
  //       modelRelations = new Map();
  //       modelPackage.relations.set(this.name, modelRelations);
  //     }

  //     if (modelRelations) {
  //       this.relations.forEach(value => {
  //         let ref = this.fields.get(value);
  //         // must be different to apply fixup
  //         if (ref && modelRelations) {
  //           modelRelations.set(ref.name, ref.clone());
  //         }
  //       });
  //     }
  //   }
  // }

  // public removeIds(modelPackage: ModelPackage) {
  //   this.identity.forEach(value => {
  //     let ids = this.fields.get(value);
  //     if (ids) {
  //       modelPackage.identityFields.delete(ids.idKey.toString());
  //     }
  //   });
  // }

  get plural(): string {
    return this.metadata_.name.plural;
  }

  get titlePlural(): string {
    return this.metadata_.titlePlural;
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

  get fields(): Map<string, IField> {
    return this.$obj.fields;
  }

  get operations(): Map<string, IOperation> {
    return this.$obj.operations;
  }

  get indexed(): Set<string> {
    return this.$obj.indexed;
  }

  protected updateIndex(f: IField, options: IndexEntryOptions) {
    // let indexes = this.getMetadata('storage.indexes', {});
    let indexName: string | string[];
    if (typeof f.indexed === 'boolean') {
      indexName = f.name;
    } else if (Array.isArray(f.indexed)) {
      indexName = f.indexed;
    } else {
      indexName = f.indexed.split(' ');
      indexName = indexName.length > 1 ? indexName : indexName[0];
    }
    let entry = {
      name: indexName,
      fields: {
        [f.name]: 1,
      },
      options,
    };
    if (typeof indexName === 'string') {
      this.mergeIndex(indexName, entry);
    } else {
      for (let i = 0, len = indexName.length; i < len; i++) {
        let index = indexName[i];
        this.mergeIndex(index, entry);
      }
    }
  }

  protected mergeIndex(index: string, entry: any) {
    const indexes = this.metadata_.persistence.indexes;
    if (this.metadata_.persistence.indexes.hasOwnProperty(index)) {
      indexes[index] = merge(indexes[index], entry);
      if (Array.isArray(indexes[index].name)) {
        indexes[index].name = indexes[index].name[0];
      } else {
        indexes[index].name = indexes[index].name;
      }
    } else {
      indexes[index] = entry;
    }
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    const result = { ...this.$obj };

    assignValue<P, I, string>({
      src: this.$obj,
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = inflected.camelize(value.trim(), true);
        this.metadata_.name.singular = src.name;
      },
      required: true,
    });

    assignValue<M, I, string>({
      src: this.metadata_,
      input,
      inputField: 'plural',
      effect: (src, value) => {
        src.name.plural = inflected.camelize(value.trim(), true);
      },
      setDefault: src => {
        src.name.plural = inflected.pluralize(this.name);
      },
    });

    assignValue<M, I, string>({
      src: this.metadata_,
      input,
      field: 'titlePlural',
      setDefault: src => {
        src.titlePlural = inflected.pluralize(this.name);
      },
    });

    assignValue<P, I, AsHash<FieldInput> | NamedArray<FieldInput>>({
      src: this.$obj,
      input,
      field: 'fields',
      effect: (src, value) => {
        const relations = new Set();
        const identity = new Set();
        const required = new Set();
        const indexed = new Set();

        const fields = new Map(
          (Array.isArray(value) ? value : HashToArray(value))
            .map((fld, order) => {
              let field: Field;
              if (isSimpleInput(fld)) {
                field = new SimpleField(
                  merge({}, fld, {
                    order,
                    entity: this.name,
                  } as Partial<SimpleFieldInput>),
                );
                if (field.identity) {
                  identity.add(field.name);
                  this.updateIndex(field, { unique: true, sparse: true });
                }

                if (field.required) {
                  required.add(field.name);
                }
                if (field.indexed) {
                  indexed.add(field.name);
                  this.updateIndex(field, { sparse: true });
                }
              } else if (isRelationFieldInput(fld)) {
                field = new RelationField(
                  merge({}, fld, {
                    order,
                    entity: this.name,
                  } as Partial<RelationFieldInput>),
                );
                if (field.relation) {
                  relations.add(field.name);
                }
              } else {
                field = new EntityField(
                  merge({}, fld, {
                    order,
                    entity: this.name,
                  } as Partial<EntityFieldInput>),
                );
                if (field.relation) {
                  relations.add(field.name);
                }
              }
              return field;
            })
            .map(f => [f.name, f] as [string, Field]),
        );
        let f: SimpleField;
        if (fields.has('id')) {
          f = fields.get('id') as SimpleField;
        } else if (fields.has('_id')) {
          f = fields.get('_id') as SimpleField;
        } else {
          f = new SimpleField({ ...DEFAULT_ID_FIELD, entity: result.name });
          fields.set(f.name, f);
        }

        f.makeIdentity();
        indexed.add(f.name);
        identity.add(f.name);
        required.add(f.name);

        src.relations = relations;
        src.identity = identity;
        src.required = required;
        src.indexed = indexed;
        src.fields = fields;
      },
      setDefault: src => (src.fields = new Map()),
    });

    assignValue<P, I, AsHash<OperationInput> | NamedArray<OperationInput>>({
      src: this.$obj,
      input,
      field: 'operations',
      effect: (src, value) => {
        src.operations = new Map(
          (Array.isArray(value) ? value : HashToArray(value))
            .map(
              (fld, order) =>
                new Operation(
                  merge({}, fld, {
                    entity: this.name,
                    order,
                  } as Partial<OperationInput>),
                ),
            )
            .map(f => [f.name, f] as [string, Operation]),
        );
      },
      setDefault: src => (src.operations = new Map<string, Operation>()),
    });
  }

  public ensureIndexes() {
    this.fields.forEach(f => {
      if (f.identity) {
        this.updateIndex(f, {});
      } else if (f.indexed) {
        this.updateIndex(f, {});
      }
    });
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields),
      operations: MapToArray(this.operations),
    } as Partial<O>);
  }
}
