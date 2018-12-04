import {
  EntityBaseMetaInfo,
  EntityBaseInput,
  EntityBasePersistence,
  IEntityBase,
  EntityBase,
  EntityBaseInternal,
} from './entitybase';
import { merge } from 'lodash';

export interface IMixin extends IEntityBase<MixinMetaInfo, MixinPersistence> {}
export interface MixinPersistence extends EntityBasePersistence {}
export interface MixinInput
  extends EntityBaseInput<MixinMetaInfo, MixinPersistence> {}
export interface MixinInternal
  extends EntityBaseInternal<MixinMetaInfo, MixinPersistence> {}
export interface MixinMetaInfo extends EntityBaseMetaInfo<MixinPersistence> {}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Mixin
  extends EntityBase<MixinMetaInfo, MixinInput, MixinInternal, MixinPersistence>
  implements IMixin {
  constructor(inp: MixinInput) {
    super(merge({}, defaultInput, inp));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public toObject(): MixinInput {
    return merge({}, super.toObject(), {} as Partial<MixinInput>);
  }
}
