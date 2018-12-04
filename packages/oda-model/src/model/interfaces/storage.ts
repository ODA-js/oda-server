import { FieldArgs, OperationKind } from './types';
import { ISimpleField, IOperation } from './model';

export interface EntityStorage extends EntityBaseStorage {
  implements: Set<string>;
  embedded: boolean | Set<string>;
  abstract: boolean;
}
