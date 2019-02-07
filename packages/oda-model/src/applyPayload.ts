import {
  ObjectTypeInput,
  isObjectTypeInput,
  ObjectType,
  isObjectType,
  IObjectType,
} from './objecttype';
import {
  ObjectTypeFieldInput,
  ObjectTypeField,
  IObjectTypeField,
} from './objecttypefield';
import {
  EnumType,
  EntityType,
  AsHash,
  isEnumType,
  isEntityType,
  ArrayToMap,
  HashToArray,
} from './types';
export function applyPayload(
  src: {
    payload:
      | string
      | EnumType
      | EntityType
      | IObjectType
      | Map<string, IObjectType | IObjectTypeField>;
  },
  value:
    | string
    | EnumType
    | EntityType
    | ObjectTypeInput
    | AsHash<ObjectTypeInput | ObjectTypeFieldInput>
    | (ObjectTypeInput | ObjectTypeFieldInput)[],
) {
  return (src.payload =
    typeof value === 'string'
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
        ));
}
