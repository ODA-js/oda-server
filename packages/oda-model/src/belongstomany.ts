import {
  IRelationBase,
  RelationBasePersistence,
  RelationBaseMetaInfo,
  RelationBaseInput,
  RelationBaseInternal,
  RelationBase,
  RelationBaseOutput,
} from './relationbase';
import { IEntityRef, EntityReference } from './entityreference';
import { merge } from 'lodash';
import {
  assignValue,
  AsHash,
  HashToArray,
  Nullable,
  NamedArray,
  MapToArray,
} from './types';
import { ISimpleField, SimpleFieldInput, SimpleField } from './simplefield';
import decapitalize from './lib/decapitalize';

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
  belongsToMany: IEntityRef;
  using: IEntityRef;
  fields: Map<string, ISimpleField>;
}

export interface BelongsToManyMetaInfo
  extends RelationBaseMetaInfo<BelongsToManyPersistence> {}

export interface BelongsToManyInternal
  extends RelationBaseInternal<
    BelongsToManyMetaInfo,
    BelongsToManyPersistence
  > {
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

const defaultMetaInfo = {
  verb: 'BelongsToMany',
  persistence: {
    single: false,
    stored: false,
    embedded: false,
  },
};
const defaultInput = { metadata: defaultMetaInfo };

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
    return this.$obj.belongsToMany;
  }

  get ref(): IEntityRef {
    return this.$obj.belongsToMany;
  }

  get using() {
    return this.$obj.using;
  }

  get fields() {
    return this.$obj.fields;
  }

  constructor(init: BelongsToManyInput) {
    super(merge({}, defaultInput, init));
    this.initNames();
  }

  public updateWith(input: Nullable<BelongsToManyInput>) {
    super.updateWith(input);
    assignValue<
      BelongsToManyInternal,
      BelongsToManyInput,
      AsHash<SimpleFieldInput> | NamedArray<SimpleFieldInput>
    >({
      src: this.$obj,
      input,
      field: 'fields',
      effect: (src, value) =>
        (src.fields = new Map<string, ISimpleField>(
          (Array.isArray(value) ? value : HashToArray(value)).map(
            i =>
              [
                i.name,
                new SimpleField({
                  name: i.name,
                  ...i,
                }),
              ] as [string, ISimpleField],
          ),
        )),
      setDefault: src => (src.fields = new Map()),
    });

    assignValue<BelongsToManyMetaInfo, BelongsToManyInput, boolean>({
      src: this.metadata_,
      input,
      inputField: 'embedded',
      effect: (src, value) => (src.persistence.embedded = value),
    });

    assignValue<BelongsToManyInternal, BelongsToManyInput, string>({
      src: this.$obj,
      input,
      field: 'belongsToMany',
      effect: (src, value) => {
        src.belongsToMany = new EntityReference(value);
        if (!src.belongsToMany.backField) {
          src.belongsToMany.backField = 'id';
        }
      },
    });

    assignValue<BelongsToManyInternal, BelongsToManyInput, string>({
      src: this.$obj,
      input,
      field: 'using',
      effect: (src, value) => {
        src.using = new EntityReference(value);
        if (!src.using.field) {
          src.using.field = decapitalize(src.entity);
        }
        if (!src.using.backField) {
          src.using.backField = 'id';
        }
      },
    });
  }

  // it get fixed object
  public toObject(): BelongsToManyOutput {
    return merge({}, super.toObject(), {
      belongsToMany: this.belongsToMany.toString(),
      fields: MapToArray(this.$obj.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
    } as Partial<BelongsToManyOutput>);
  }
}
