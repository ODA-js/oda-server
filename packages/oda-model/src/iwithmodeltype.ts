import { MetaModelType } from './types';

export interface IWithModelType {
  /**
   * the kind of current item
   */
  readonly modelType: MetaModelType;
}
