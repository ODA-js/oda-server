import {
  RecordInput,
  isRecordInput,
  Record,
  isRecord,
  IRecord,
} from './record';
import { RecordFieldInput, RecordField, IRecordField } from './recordfield';
import { AsHash, ArrayToMap, HashToArray } from './types';
export function applyArgs(
  src: {
    args: Map<string, IRecord | IRecordField>;
  },
  value:
    | AsHash<RecordFieldInput | RecordInput>
    | (RecordFieldInput | RecordInput)[],
) {
  return (src.args = ArrayToMap(
    Array.isArray(value) ? value : HashToArray(value),
    v =>
      isRecordInput(v)
        ? new Record({ ...v, kind: 'input' })
        : new RecordField({ ...v, kind: 'input' }),
    (obj, src) =>
      isRecord(obj) && isRecord(src)
        ? obj.mergeWith(src.toObject())
        : !isRecord(obj) && !isRecord(src)
        ? obj.mergeWith(src.toObject())
        : obj,
  ));
}
