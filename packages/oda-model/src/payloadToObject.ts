import { isObjectType, IObjectType } from './objecttype';
import { IObjectTypeField } from './objecttypefield';
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
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
}) {
  return typeof internal.payload === 'string'
    ? internal.payload
    : isEnumType(internal.payload) ||
      isEntityType(internal.payload) ||
      isObjectType(internal.payload)
    ? isObjectType(internal.payload)
      ? internal.payload.toObject()
      : internal.payload
    : MapToArray(internal.payload, (_name, value) => value.toObject());
}
