import {
  RecordInput,
  isRecordInput,
  Record,
  isRecord,
  IRecord,
} from './record';
import { RecordFieldInput, RecordField, IRecordField } from './recordfield';
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
      | IRecord
      | Map<string, IRecord | IRecordField>;
  },
  value:
    | string
    | EnumType
    | EntityType
    | RecordInput
    | AsHash<RecordInput | RecordFieldInput>
    | (RecordInput | RecordFieldInput)[],
) {
  return (src.payload =
    typeof value === 'string'
      ? value
      : isEnumType(value) || isEntityType(value) || isRecordInput(value)
      ? isRecordInput(value)
        ? new Record(value)
        : value
      : ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          v =>
            isRecordInput(v)
              ? new Record({ ...v, kind: 'output' })
              : new RecordField({ ...v, kind: 'output' }),
          (obj, src) =>
            isRecord(obj) && isRecord(src)
              ? obj.mergeWith(src.toObject())
              : !isRecord(obj) && !isRecord(src)
              ? obj.mergeWith(src.toObject())
              : obj,
        ));
}
