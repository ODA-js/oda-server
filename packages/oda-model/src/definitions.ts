import { ScalarTypeNames } from './types';

export const REF_PATTERN = /^(?:(.*?)@)?(.*?)(?:#(.*?))?$/;

export const DEFAULT_ID_FIELDNAME = 'id';

export const DEFAULT_ID_FIELD = {
  name: DEFAULT_ID_FIELDNAME,
  type: 'ID' as ScalarTypeNames,
  identity: true,
  required: true,
};
