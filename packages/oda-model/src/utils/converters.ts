import {
  ObjectTypeInput,
  isObjectTypeInput,
  ObjectType,
  isObjectType,
  IObjectType,
} from '../objecttype';
import {
  ObjectTypeFieldInput,
  ObjectTypeField,
  IObjectTypeField,
} from '../objecttypefield';

import {
  EnumType,
  EntityType,
  AsHash,
  MapToArray,
  isEnumType,
  isEntityType,
  ArrayToMap,
  HashToArray,
  ScalarType,
  ScalarTypeExtension,
  isScalarType,
  isScalarTypeExtension,
  stringToScalar,
} from '../types';

/**
 * convert internal payload to output presentation
 * @param payload internal payload
 */
export function outputPayload(
  payload:
    | string
    | ScalarType
    | ScalarTypeExtension
    | EnumType
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>,
) {
  return typeof payload === 'string'
    ? stringToScalar(payload)
    : isScalarType(payload) || isScalarTypeExtension(payload)
    ? payload
    : isEnumType(payload) || isEntityType(payload) || isObjectType(payload)
    ? isObjectType(payload)
      ? payload.toObject()
      : payload
    : MapToArray(payload, (_name, value) => value.toObject());
}

/**
 * convert input args to internal presentation
 * @param value args
 */
export function inputArgs(
  value:
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | (ObjectTypeFieldInput | ObjectTypeInput)[],
): Map<string, IObjectTypeField | IObjectType> {
  return ArrayToMap(
    Array.isArray(value) ? value : HashToArray(value),
    v =>
      isObjectTypeInput(v)
        ? new ObjectType({ ...v, kind: 'input' })
        : new ObjectTypeField({ ...v, kind: 'input' }),
    (obj, src) =>
      isObjectType(obj) && isObjectType(src)
        ? obj.mergeWith(src.toObject())
        : !isObjectType(obj) && !isObjectType(src)
        ? obj.mergeWith(src.toObject())
        : obj,
  );
}

/**
 * convert input payload to internal presentation
 * @param value payload
 */
export function inputPayload(
  value:
    | string
    | ScalarType
    | ScalarTypeExtension
    | EnumType
    | EntityType
    | ObjectTypeInput
    | AsHash<ObjectTypeInput | ObjectTypeFieldInput>
    | (ObjectTypeInput | ObjectTypeFieldInput)[],
):
  | ScalarType
  | ScalarTypeExtension
  | EnumType
  | EntityType
  | IObjectType
  | Map<string, IObjectType | IObjectTypeField> {
  return typeof value === 'string'
    ? stringToScalar(value)
    : isScalarType(value) || isScalarTypeExtension(value)
    ? value
    : isEnumType(value) || isEntityType(value) || isObjectTypeInput(value)
    ? isObjectTypeInput(value)
      ? new ObjectType(value)
      : value
    : ArrayToMap(
        Array.isArray(value) ? value : HashToArray(value),
        v =>
          isObjectTypeInput(v)
            ? new ObjectType({ ...v, kind: 'output' })
            : new ObjectTypeField({ ...v, kind: 'output' }),
        (obj, src) =>
          isObjectType(obj) && isObjectType(src)
            ? obj.mergeWith(src.toObject())
            : !isObjectType(obj) && !isObjectType(src)
            ? obj.mergeWith(src.toObject())
            : obj,
      );
}
