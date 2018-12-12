import {
  EntityBasePersistence,
  EntityBaseInternal,
  EntityBaseMetaInfo,
  EntityBaseInput,
  IEntityBase,
  EntityBase,
  EntityBaseOutput,
} from './entitybase';
import { MetaModelType, Nullable, assignValue } from './types';
import { merge } from 'lodash';

export interface IEntity
  extends IEntityBase<
    EntityMetaInfo,
    EntityPersistence,
    EntityInput,
    EntityOutput
  > {
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
const defaultInput = { metadata: defaultMetaInfo };

export class Entity
  extends EntityBase<
    EntityMetaInfo,
    EntityInput,
    EntityInternal,
    EntityPersistence,
    EntityOutput
  >
  implements IEntity {
  public get modelType(): MetaModelType {
    return 'entity';
  }

  constructor(init: EntityInput) {
    super(merge({}, defaultInput, init));
  }

  get implements(): Set<string> {
    return this.$obj.implements;
  }

  get abstract(): boolean {
    return this.$obj.abstract;
  }

  get embedded(): boolean | Set<string> {
    return this.$obj.embedded;
  }

  public updateWith(input: Nullable<EntityInput>) {
    super.updateWith(input);

    assignValue({
      src: this.$obj,
      input,
      field: 'abstract',
      setDefault: src => (src.abstract = false),
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
      setDefault: src => (src.embedded = false),
    });
  }

  public toObject(): EntityOutput {
    return merge({}, super.toObject(), {
      implements: [...this.implements.values()],
      embedded: this.embedded,
      abstract: this.abstract,
    } as Partial<EntityOutput>);
  }
}
