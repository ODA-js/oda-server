import {
  IRelationBase,
  RelationBasePersistence,
  RelationBaseMetaInfo,
  RelationBaseInput,
  RelationBaseInternal,
  RelationBase,
  RelationBaseOutput,
} from './relationbase';
import { IEntityRef, EntityReference, EntityRefInput } from './entityreference';
import { merge, mergeWith } from 'lodash';
import {
  assignValue,
  AsHash,
  Nullable,
  NamedArray,
  MapToArray,
  HashToArray,
  ArrayToMap,
} from './types';
import { ISimpleField, SimpleFieldInput, SimpleField } from './simplefield';
import decapitalize from './lib/decapitalize';
import { Internal } from './element';

export interface BelongsToManyPersistence extends RelationBasePersistence {
  single: boolean;
  stored: boolean;
  embedded: boolean;
}

export interface IBelongsToManyRelation
  extends IRelationBase<
    BelongsToManyMetaInfo,
    BelongsToManyInput,
    BelongsToManyPersistence,
    BelongsToManyOutput
  > {
  readonly belongsToMany: IEntityRef;
  readonly using: IEntityRef;
  readonly fields: Map<string, ISimpleField>;
}

export interface BelongsToManyMetaInfo
  extends RelationBaseMetaInfo<BelongsToManyPersistence> {}

export interface BelongsToManyInternal extends RelationBaseInternal {
  belongsToMany: IEntityRef;
  using: IEntityRef;
  fields: Map<string, ISimpleField>;
}

export interface BelongsToManyInput
  extends RelationBaseInput<BelongsToManyMetaInfo, BelongsToManyPersistence> {
  belongsToMany: string;
  using: string;
  fields?: AsHash<SimpleFieldInput> | NamedArray<SimpleFieldInput>;
}

export interface BelongsToManyOutput
  extends RelationBaseOutput<BelongsToManyMetaInfo, BelongsToManyPersistence> {
  belongsToMany: string;
  using: string;
  fields?: NamedArray<SimpleFieldInput>;
}

export const belongsToManyDefaultMetaInfo = {
  verb: 'BelongsToMany',
  persistence: {
    single: false,
    stored: false,
    embedded: false,
  },
};
export const belongsToManyDefaultInput = {
  metadata: belongsToManyDefaultMetaInfo,
};

export class BelongsToMany
  extends RelationBase<
    BelongsToManyMetaInfo,
    BelongsToManyInput,
    BelongsToManyInternal,
    BelongsToManyPersistence,
    BelongsToManyOutput
  >
  implements IBelongsToManyRelation {
  get belongsToMany(): IEntityRef {
    return this[Internal].belongsToMany;
  }

  get ref(): IEntityRef {
    return this[Internal].belongsToMany;
  }

  get using() {
    return this[Internal].using;
  }

  get fields() {
    return this[Internal].fields;
  }

  constructor(init: BelongsToManyInput) {
    super(merge({}, belongsToManyDefaultInput, init));
  }

  public updateWith(input: Nullable<BelongsToManyInput>) {
    super.updateWith(input);
    assignValue<
      BelongsToManyInternal,
      BelongsToManyInput,
      AsHash<SimpleFieldInput> | NamedArray<SimpleFieldInput>
    >({
      src: this[Internal],
      input,
      field: 'fields',
      effect: (src, value) =>
        (src.fields = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          i => new SimpleField(i),
          (obj, src) => obj.mergeWith(src.toObject()),
        )),
      setDefault: src => (src.fields = new Map()),
    });

    assignValue<
      BelongsToManyInternal,
      BelongsToManyInput,
      BelongsToManyInput['belongsToMany']
    >({
      src: this[Internal],
      input,
      field: 'belongsToMany',
      effect: (src, value) => {
        src.belongsToMany = new EntityReference(value);
        if (!src.belongsToMany.backField) {
          src.belongsToMany.updateWith({ backField: 'id' } as Nullable<
            EntityRefInput
          >);
        }
      },
    });

    assignValue<
      BelongsToManyInternal,
      BelongsToManyInput,
      BelongsToManyInput['using']
    >({
      src: this[Internal],
      input,
      field: 'using',
      effect: (src, value) => {
        src.using = new EntityReference(value);
        if (!src.using.field) {
          src.using.updateWith({ field: decapitalize(src.entity) } as Nullable<
            EntityRefInput
          >);
        }
        if (!src.using.backField) {
          src.using.updateWith({ backField: 'id' } as Nullable<EntityRefInput>);
        }
      },
    });
  }

  // it get fixed object
  public toObject(): BelongsToManyOutput {
    return merge({}, super.toObject(), {
      belongsToMany: this.belongsToMany.toString(),
      using: this.using.toString(),
      fields: MapToArray(this[Internal].fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<BelongsToManyOutput>);
  }
  public mergeWith(payload: Nullable<BelongsToManyInput>) {
    const update = mergeWith(
      this.toObject(),
      payload,
      (
        o: any,
        s: any,
        key: string,
        _obj: any,
        _source: any,
        _stack: string[],
      ) => {
        if (key === 'fields') {
          return [...o, ...s];
        }
        if (key == 'name') {
          return o;
        }
        return;
      },
    );
    this.updateWith(update);
  }
}
