import { SimpleField, SimpleFieldInput, ISimpleField } from './simplefield';
import { EntityField, EntityFieldInput, IEntityField } from './entityfield';
import {
  RelationField,
  RelationFieldInput,
  IRelationField,
} from './relationfield';

export type Field = SimpleField | EntityField | RelationField;
export type FieldInput =
  | SimpleFieldInput
  | EntityFieldInput
  | RelationFieldInput;

export type IField = ISimpleField | IEntityField | IRelationField;

export function isEntityFieldInput(
  input: FieldInput,
): input is EntityFieldInput {
  return ((input as unknown) as EntityField).type.type === 'entity';
}

export function isRelationFieldInput(
  input: FieldInput,
): input is RelationFieldInput {
  return !!(input as RelationFieldInput).relation;
}
export function isSimpleInput(input: FieldInput): input is SimpleFieldInput {
  return !(isEntityFieldInput(input) || isRelationFieldInput(input));
}
