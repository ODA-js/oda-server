import {
  SimpleField,
  SimpleFieldInput,
  ISimpleField,
  SimpleFieldOutput,
} from './simplefield';
import {
  EntityField,
  EntityFieldInput,
  IEntityField,
  EntityFieldOutput,
} from './entityfield';
import {
  RelationField,
  RelationFieldInput,
  IRelationField,
  RelationFieldOutput,
} from './relationfield';

export type Field = SimpleField | EntityField | RelationField;
export type FieldInput =
  | SimpleFieldInput
  | EntityFieldInput
  | RelationFieldInput;

export type FieldOutput =
  | SimpleFieldOutput
  | EntityFieldOutput
  | RelationFieldOutput;

export type IField = ISimpleField | IEntityField | IRelationField;

export function isEntityFieldInput(
  input: FieldInput,
): input is EntityFieldInput {
  const ent = (input as unknown) as EntityField;
  return ent.type && ent.type.type === 'entity';
}

export function isRelationFieldInput(
  input: FieldInput,
): input is RelationFieldInput {
  return !!(input as RelationFieldInput).relation;
}
export function isSimpleInput(input: FieldInput): input is SimpleFieldInput {
  return !(isEntityFieldInput(input) || isRelationFieldInput(input));
}
