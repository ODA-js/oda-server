import { isRecord, IRecord } from './record';
import { IRecordField } from './recordfield';
import {
  EnumType,
  EntityType,
  isEnumType,
  isEntityType,
  MapToArray,
} from './types';
export function payloadToObject(internal: {
  payload:
    | string
    | EnumType
    | EntityType
    | IRecord
    | Map<string, IRecord | IRecordField>;
}) {
  return typeof internal.payload === 'string'
    ? internal.payload
    : isEnumType(internal.payload) ||
      isEntityType(internal.payload) ||
      isRecord(internal.payload)
    ? isRecord(internal.payload)
      ? internal.payload.toObject()
      : internal.payload
    : MapToArray(internal.payload, (_name, value) => value.toObject());
}
