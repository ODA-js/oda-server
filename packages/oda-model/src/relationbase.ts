import {
  IMeta,
  ElementMetaInfo,
  ElementInput,
  Element,
  ElementInternal,
} from './element';
import { RelationType, MetaModelType, assignValue, Nullable } from './model';
import { IEntityRef } from './entityreference';
import { ISimpleField } from './simplefield';
import { merge } from 'lodash';
import decapitalize from './lib/decapitalize';
import * as inflected from 'inflected';

/**
 * base Relation for relation definition
 */
export interface IRelation<
  T extends RelationBaseMetaInfo<P>,
  K extends RelationBaseInput<T, P>,
  P extends RelationBasePersistence
> extends IMeta<T, K> {
  /**
   * the verb of relation
   */
  verb: RelationType;
  /**
   * the reference to specific entity
   */
  ref: IEntityRef | never;
  /**
   * set of fields
   */
  fields: Map<string, ISimpleField>;
  /**
   * the opposite field
   */
  opposite?: string;
}

export interface RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface RelationBaseMetaInfo<T extends RelationBasePersistence>
  extends ElementMetaInfo {
  verb: RelationType;
  persistence: T;
  name: {
    full: string;
    short: string;
    normal: string;
  };
}

export interface RelationBaseInternal<
  T extends RelationBaseMetaInfo<P>,
  P extends RelationBasePersistence
> extends ElementInternal<T> {
  name: string;
  entity: string;
  field: string;
  fields: Map<string, ISimpleField>;
  opposite?: string;
}

export interface RelationBaseInput<
  T extends RelationBaseMetaInfo<P>,
  P extends RelationBasePersistence
> extends ElementInput<T> {
  entity: string;
  field: string;
  name?: string;
  embedded?: boolean;
  opposite?: string;
}

const defaultMetaInfo = { persistence: {} };
const defaultInternal = {};
const defaultInput = {};

export abstract class RelationBase<
  T extends RelationBaseMetaInfo<P>,
  I extends RelationBaseInput<T, P>,
  S extends RelationBaseInternal<T, P>,
  P extends RelationBasePersistence
> extends Element<T, I, S> implements IRelation<T, I, P> {
  public get modelType(): MetaModelType {
    return this.verb;
  }
  /**
   * construct object
   */
  constructor(inp: RelationBaseInput<T, P>) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
    this.initNames();
  }

  get name(): string {
    return this.$obj.name;
  }

  get field(): string {
    return this.$obj.field;
  }

  get entity(): string {
    return this.$obj.entity;
  }

  get fields(): Map<string, ISimpleField> {
    return this.$obj.fields;
  }

  get ref(): IEntityRef | never {
    throw new Error('ref is need to be overridden by descendants');
  }

  get verb(): RelationType {
    return this.metadata_.verb;
  }

  // one item per relation
  get single() {
    return this.metadata_.persistence.single;
  }

  // key is storage is located in owner side of entity
  get stored() {
    return this.metadata_.persistence.stored;
  }

  // stored as members of class
  get embedded() {
    return this.metadata_.persistence.embedded;
  }

  // opposite entity field with relation def
  get opposite() {
    return this.$obj.opposite;
  }

  set opposite(val) {
    this.$obj.opposite = val;
  }

  protected initNames() {
    if (!this.name) {
      let ref = this.single
        ? inflected.singularize(this.$obj.field)
        : inflected.pluralize(this.$obj.field);

      this.metadata_.name.full = `${this.$obj.entity}${
        this.verb
      }${inflected.camelize(ref, true)}`;

      let ref1 = this.single
        ? inflected.singularize(this.$obj.field)
        : inflected.pluralize(this.$obj.field);

      this.metadata_.name.normal = `${this.$obj.entity}${
        this.verb
      }${inflected.camelize(ref1, true)}`;

      let ref2 = this.single
        ? inflected.singularize(this.$obj.field)
        : inflected.pluralize(this.$obj.field);

      this.metadata_.name.normal = `${this.$obj.entity}${
        this.verb
      }${inflected.camelize(ref2, true)}`;
    } else {
      this.metadata_.name.normal = this.metadata_.name.normal = this.metadata_.name.short = this.name;
    }
  }

  get fullName() {
    return this.metadata_.name.full;
  }

  get normalName() {
    return this.metadata_.name.normal;
  }

  get shortName() {
    return this.metadata_.name.short;
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<S, RelationBaseInput<T, P>, string>({
      src: this.$obj,
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = inflected.camelize(value.trim());
        this.initNames();
      },
    });

    assignValue<S, RelationBaseInput<T, P>, string>({
      src: this.$obj,
      input,
      field: 'opposite',
      effect: (src, value) => (src.opposite = decapitalize(value.trim())),
    });

    assignValue({
      src: this.$obj,
      input,
      field: 'entity',
    });

    assignValue({
      src: this.$obj,
      input,
      field: 'field',
    });
  }

  public toObject(): I {
    return merge({}, super.toObject(), {
      name: this.name,
      entity: this.entity,
      field: this.field,
      opposite: this.opposite,
      embedded: this.embedded,
    });
  }
}
