import { MetadataInput, IMeta } from './interfaces';
import { BaseMeta } from './interfaces/metadata';
import { merge, cloneDeep } from 'lodash';
/**
 * abstract base for any modeled item
 */
export abstract class Metadata<T extends BaseMeta, K extends MetadataInput<T>>
  implements IMeta<T, K> {
  protected metadata_: T;
  /**
   * metadata is not immutable
   */
  public get metadata(): T {
    return this.metadata_;
  }

  constructor(inp: MetadataInput<T>) {
    this.metadata_ = {} as T;
    this.updateWith(inp);
  }
  /**
   * patches metadata for entity
   * @param obj metadata patch object
   */
  public updateWith(obj: MetadataInput<T>) {
    if (obj.metadata) {
      this.metadata_ = merge({}, this.metadata_, obj.metadata);
    }
  }
  /**
   * make item usable within another constructor
   * it is suitable for cloning items
   */
  public toObject(): K {
    return {
      metadata: cloneDeep(this.metadata_),
    } as K;
  }
}
