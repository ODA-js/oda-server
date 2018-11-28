import {
  MutationInput,
  MutationStorage,
  MutationMeta,
  MapToHash,
  HashToMap,
  MetaModelType,
} from './interfaces';
import { ModelBase } from './modelbase';
import { IMutation } from './interfaces/model';

export class Mutation
  extends ModelBase<MutationMeta, MutationInput, MutationStorage>
  implements IMutation {
  public modelType: MetaModelType = 'mutation';
  constructor(inp: MutationInput) {
    super(inp);
  }
  public get args() {
    return this.$obj.args;
  }

  public get payload() {
    return this.$obj.payload;
  }

  public updateWith(obj: MutationInput) {
    if (obj) {
      super.updateWith(obj);
      this.$obj.args = HashToMap(obj.args);
      this.$obj.payload = HashToMap(obj.payload);
    }
  }

  public toObject(): MutationInput {
    return {
      ...super.toObject(),
      args: MapToHash(this.$obj.args),
      payload: MapToHash(this.$obj.payload),
    };
  }
}
