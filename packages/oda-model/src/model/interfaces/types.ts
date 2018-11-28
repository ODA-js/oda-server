export type RelationType = 'HasMany' | 'HasOne' | 'BelongsToMany' | 'BelongsTo';

export type MetaModelType =
  | 'metadata'
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
  | 'field-base'
  | 'field'
  | 'enum-field'
  | 'entity-field'
  | 'relation-field'
  | 'relation'
  | 'operation'
  | 'ref'
  | RelationType;

export type Multiplicity = 'one' | 'many';
/**
 * kind of complex type
 */
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
/**
 * Complext type can refer to existing type system
 */
export type EntityType = {
  /**
   * complext type name
   */
  name: string;
  /**
   * kind of complex type
   */
  type: 'entity';
  /**
   * multiplicity of it
   */
  multiplicity: Multiplicity;
};

export type EnumType = {
  /**
   * complext type name
   */
  name: string;
  /**
   * kind of complex type
   */
  type: 'enum';
  /**
   * multiplicity of it
   */
  multiplicity: Multiplicity;
};

export type FieldType = string | EnumType | EntityType;

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
