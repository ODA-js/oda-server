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
import { AsHash, ArrayToMap, HashToArray } from './types';
export function applyArgs(
  src: {
    args: Map<string, IObjectType | IObjectTypeField>;
  },
  value:
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | (ObjectTypeFieldInput | ObjectTypeInput)[],
) {
  return (src.args = ArrayToMap(
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
  ));
}
