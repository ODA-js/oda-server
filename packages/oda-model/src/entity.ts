import {
  EntityBasePersistence,
  EntityBaseInternal,
  EntityBaseMetaInfo,
  EntityBaseInput,
  IEntityBase,
  EntityBase,
  EntityBaseOutput,
} from './entitybase';
import { MetaModelType, Nullable, assignValue } from './model';
import { merge } from 'lodash';
import { ModelPackage, IPackage } from './modelpackage';
import { Field, IField } from './field';

export interface IEntity
  extends IEntityBase<EntityMetaInfo, EntityPersistence> {
  implements: Set<string>;
  embedded: boolean | Set<string>;
  abstract: boolean;
}

export interface EntityInternal
  extends EntityBaseInternal<EntityMetaInfo, EntityPersistence> {
  implements: Set<string>;
  embedded: boolean | Set<string>;
  abstract: boolean;
}

export interface EntityPersistence extends EntityBasePersistence {}

export interface EntityInput
  extends EntityBaseInput<EntityMetaInfo, EntityPersistence> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface EntityOutput
  extends EntityBaseOutput<EntityMetaInfo, EntityPersistence> {
  implements?: string[];
  embedded?: boolean | string[];
  abstract?: boolean;
}

export interface EntityMetaInfo extends EntityBaseMetaInfo<EntityPersistence> {}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Entity
  extends EntityBase<
    EntityMetaInfo,
    EntityInput,
    EntityInternal,
    EntityPersistence,
    EntityOutput
  >
  implements IEntity {
  public modelType: MetaModelType = 'entity';

  constructor(inp: EntityInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  get implements(): Set<string> {
    return this.$obj.implements;
  }

  get abstract(): boolean {
    return !!this.$obj.abstract;
  }

  get embedded(): boolean | Set<string> {
    return this.$obj.embedded;
  }

  public ensureImplementation(modelPackage: IPackage) {
    const newFields: Map<string, IField> = new Map<string, IField>();
    this.implements.forEach(mixin => {
      if (modelPackage.mixins.has(mixin)) {
        const impl = modelPackage.mixins.get(mixin);
        if (impl) {
          impl.fields.forEach(f => {
            if (!this.fields.has(f.name)) {
              newFields.set(f.name, f);
            }
          });
        }
      }
    });

    if (newFields.size > 0) {
      const update = this.toObject();
      update.fields.push(...[...newFields.values()].map(f => f.toObject()));
      this.updateWith(update);
      this.ensureIds(modelPackage);
    }
  }

  public updateWith(input: Nullable<EntityInput>) {
    super.updateWith(input);

    assignValue({
      src: this.$obj,
      input,
      field: 'abstract',
    });
    assignValue<EntityInternal, EntityInput, string[]>({
      src: this.$obj,
      input,
      field: 'implements',
      effect: (src, value) => (src.implements = new Set(value)),
      setDefault: src => (src.implements = new Set()),
    });

    assignValue<EntityInternal, EntityInput, boolean | string[]>({
      src: this.$obj,
      input,
      field: 'embedded',
      effect: (src, value) =>
        (src.embedded = typeof value === 'boolean' ? value : new Set(value)),
      setDefault: src => (src.embedded = new Set()),
    });
  }

  public toObject(): EntityOutput {
    return merge({}, super.toObject(), {
      implements: [...this.implements],
      embedded: this.embedded,
      abstract: this.abstract,
    } as Partial<EntityOutput>);
  }
}
