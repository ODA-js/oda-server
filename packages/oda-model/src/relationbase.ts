import {
  IMeta,
  ElementMetaInfo,
  ElementInput,
  Element,
  ElementInternal,
  ElementOutput,
  Internal,
  MetaData,
} from './element';
import { RelationType, MetaModelType, assignValue, Nullable } from './types';
import { IEntityRef } from './entityreference';
import { merge } from 'lodash';
import decapitalize from './lib/decapitalize';
import * as inflected from 'inflected';

/**
 * base Relation for relation definition
 */
export interface IRelationBase<
  T extends RelationBaseMetaInfo<P>,
  K extends RelationBaseInput<T, P>,
  P extends RelationBasePersistence,
  O extends RelationBaseOutput<T, P>
> extends IMeta<T, K, O> {
  /**
   * the verb of relation
   */
  readonly verb: RelationType;
  /**
   * the reference to specific entity
   */
  readonly ref: IEntityRef | never;
  /**
   * the opposite field
   */
  readonly opposite?: string;
  readonly name: string;
  readonly field: string;
  readonly entity: string;
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

export interface RelationBaseInternal extends ElementInternal {
  name: string;
  entity: string;
  field: string;
  opposite?: string;
}

export interface RelationBaseInput<
  T extends RelationBaseMetaInfo<P>,
  P extends RelationBasePersistence
> extends ElementInput<T> {
  entity?: string;
  field?: string;
  name?: string;
  embedded?: boolean;
  opposite?: string;
}

export interface RelationBaseOutput<
  T extends RelationBaseMetaInfo<P>,
  P extends RelationBasePersistence
> extends ElementOutput<T> {
  entity: string;
  field: string;
  name?: string;
  embedded?: boolean;
  opposite?: string;
}

export const relationBaseDefaultMetaInfo = {
  verb: 'RelatedTo',
  persistence: {},
  name: {},
};
export const relationBaseDefaultInput = {
  metadata: relationBaseDefaultMetaInfo,
};

export class RelationBase<
  T extends RelationBaseMetaInfo<P>,
  I extends RelationBaseInput<T, P>,
  S extends RelationBaseInternal,
  P extends RelationBasePersistence,
  O extends RelationBaseOutput<T, P>
> extends Element<T, I, S, O> implements IRelationBase<T, I, P, O> {
  public get modelType(): MetaModelType {
    return this.verb;
  }
  /**
   * construct object
   */
  constructor(init: RelationBaseInput<T, P>) {
    super(merge({}, relationBaseDefaultInput, init));
    this.initNames();
  }

  get name(): string {
    return this[Internal].name;
  }

  get field(): string {
    return this[Internal].field;
  }

  get entity(): string {
    return this[Internal].entity;
  }

  get ref(): IEntityRef | never {
    throw new Error('ref is need to be overridden by descendants');
  }

  get verb(): RelationType {
    return this.metadata.verb;
  }

  // one item per relation
  get single() {
    return this.metadata.persistence.single;
  }

  // key is storage is located in owner side of entity
  get stored() {
    return this.metadata.persistence.stored;
  }

  // stored as members of class
  get embedded() {
    return this.metadata.persistence.embedded;
  }

  // opposite entity field with relation def
  get opposite() {
    return this[Internal].opposite;
  }

  set opposite(val) {
    this.updateWith({ opposite: val } as Nullable<I>);
  }

  protected initNames() {
    if (this.name) {
      this.metadata.name.full = this.name;
    } else {
      let ref = this.single
        ? inflected.singularize(this[Internal].field || '')
        : inflected.pluralize(this[Internal].field || '');

      this.metadata.name.full = `${this[Internal].entity || ''}${
        this.verb
      }${inflected.camelize(ref, true)}`;
      this[Internal].name = this[MetaData].name.full;
    }

    let ref1 = this.single
      ? inflected.singularize(this[Internal].field || '')
      : inflected.pluralize(this[Internal].field || '');

    this.metadata.name.normal = `${this[Internal].entity ||
      ''}${inflected.camelize(ref1, true)}`;

    let ref2 = this.single
      ? inflected.singularize(this[Internal].field || '')
      : inflected.pluralize(this[Internal].field || '');

    this.metadata.name.short = `${inflected.camelize(ref2, true)}`;
  }

  get fullName() {
    return this.metadata.name.full;
  }

  get normalName() {
    return this.metadata.name.normal;
  }

  get shortName() {
    return this.metadata.name.short;
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public updateWith(input: Nullable<I>) {
    super.updateWith(input);

    assignValue<
      RelationBaseMetaInfo<RelationBasePersistence>,
      RelationBaseInput<T, P>,
      boolean
    >({
      src: this.metadata,
      input,
      inputField: 'embedded',
      effect: (src, value) => (src.persistence.embedded = value),
      required: true,
      setDefault: src => (src.persistence.embedded = false),
    });

    assignValue<S, RelationBaseInput<T, P>, string>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = inflected.camelize(value.trim());
      },
    });

    assignValue<S, RelationBaseInput<T, P>, string>({
      src: this[Internal],
      input,
      field: 'opposite',
      effect: (src, value) => (src.opposite = decapitalize(value.trim())),
    });

    assignValue({
      src: this[Internal],
      input,
      field: 'entity',
    });

    assignValue({
      src: this[Internal],
      input,
      field: 'field',
    });
  }

  public toObject(): O {
    return merge({}, super.toObject(), {
      name: this.name,
      entity: this.entity,
      field: this.field,
      opposite: this.opposite,
      embedded: this.embedded,
    } as Partial<O>);
  }
}
