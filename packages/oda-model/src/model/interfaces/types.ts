export type RelationType = 'HasMany' | 'HasOne' | 'BelongsToMany' | 'BelongsTo';

export type MetaModelType =
  | 'model'
  | 'query'
  | 'mutation'
  | 'package'
  | 'entity'
  | 'scalar'
  | 'mixin'
  | 'union'
  | 'enum'
  | 'enum-item'
  | 'field'
  | 'relation'
  | 'complex-field'
  | 'relation-field'
  | 'operation'
  | 'ref'
  | RelationType;

export type Multiplicity = 'one' | 'many';

export type ComplexTypeKind = 'enum' | 'entity';

export type OperationKind = 'create' | 'read' | 'update' | 'delete';

export type DirectiveLocation =
  | 'QUERY'
  | 'MUTATION'
  | 'SUBSCRIPTION'
  | 'FIELD'
  | 'FRAGMENT_DEFINITION'
  | 'FRAGMENT_SPREAD'
  | 'INLINE_FRAGMENT'
  | 'SCHEMA'
  | 'SCALAR'
  | 'OBJECT'
  | 'FIELD_DEFINITION'
  | 'ARGUMENT_DEFINITION'
  | 'INTERFACE'
  | 'UNION'
  | 'ENUM'
  | 'ENUM_VALUE'
  | 'INPUT_OBJECT'
  | 'INPUT_FIELD_DEFINITION';

export interface INamed {
  readonly name: string;
}

export interface FieldArgsForHash {
  type?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface FieldArgs extends INamed, FieldArgsForHash {}

export type ComplexType = {
  name: string;
  type: ComplexTypeKind;
  multiplicity: Multiplicity;
};

export type FieldType = string | ComplexType;

export interface AsHash<T extends INamed> {
  [name: string]: T;
}

export function HashToMap<T extends INamed>(input: AsHash<T>): Map<string, T> {
  const res = Object.keys(input).map(name => {
    return [name, input[name] as T] as [string, T];
  });
  return new Map(res);
}

export function MapToHash<T extends INamed>(input: Map<string, T>): AsHash<T> {
  return [...input.entries()].reduce(
    (hash, [name, value]) => {
      hash[name] = value;
      return hash;
    },
    {} as AsHash<T>,
  );
}
