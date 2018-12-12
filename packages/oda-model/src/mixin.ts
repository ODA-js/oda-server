import {
  EntityBaseMetaInfo,
  EntityBaseInput,
  EntityBasePersistence,
  IEntityBase,
  EntityBase,
  EntityBaseInternal,
  EntityBaseOutput,
} from './entitybase';
import { merge } from 'lodash';
import { Nullable, MetaModelType } from './types';

export interface IMixin
  extends IEntityBase<
    MixinMetaInfo,
    MixinPersistence,
    MixinInput,
    MixinOutput
  > {}
export interface MixinPersistence extends EntityBasePersistence {}
export interface MixinInput
  extends EntityBaseInput<MixinMetaInfo, MixinPersistence> {}
export interface MixinOutput
  extends EntityBaseOutput<MixinMetaInfo, MixinPersistence> {}
export interface MixinInternal
  extends EntityBaseInternal<MixinMetaInfo, MixinPersistence> {}
export interface MixinMetaInfo extends EntityBaseMetaInfo<MixinPersistence> {}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

export class Mixin
  extends EntityBase<
    MixinMetaInfo,
    MixinInput,
    MixinInternal,
    MixinPersistence,
    MixinOutput
  >
  implements IMixin {
  public get modelType(): MetaModelType {
    return 'mixin';
  }
  constructor(init: MixinInput) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(input: Nullable<MixinInput>) {
    super.updateWith(input);
  }

  public toObject(): MixinOutput {
    return merge({}, super.toObject(), {} as Partial<MixinOutput>);
  }
}
