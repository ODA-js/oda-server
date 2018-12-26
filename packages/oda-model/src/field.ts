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

export function isISimpleField(input: IField): input is ISimpleField {
  return input.modelType === 'simple-field';
}
export function isIEntityField(input: IField): input is IEntityField {
  return input.modelType === 'entity-field';
}

export function isIRelationField(input: IField): input is IRelationField {
  return input.modelType === 'relation-field';
}

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

export function mergeStringArray(
  source: string[] | string,
  dest: string[] | string,
) {
  if (!Array.isArray(source)) {
    source = [source];
  }
  let existing = source.reduce(
    (res, cur) => {
      res[cur] = 1;
      return res;
    },
    {} as { [key: string]: number },
  );
  if (Array.isArray(dest)) {
    existing = dest.reduce(
      (res, cur) => {
        res[cur] = 1;
        return res;
      },
      existing as any,
    );
  } else {
    existing[dest] = 1;
  }
  return Object.keys(existing);
}
