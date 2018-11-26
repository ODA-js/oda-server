export type RelationType = 'HasMany' | 'HasOne' | 'BelongsToMany' | 'BelongsTo';

export type MetaModelType =
  | 'model'
  | 'package'
  | 'entity'
  | 'entitybase'
  | 'object-type'
  | 'scalar'
  | 'mixin'
  | 'union'
  | 'enum'
  | 'field'
  | 'relation'
  | 'operation'
  | 'ref'
  | RelationType;

export type Multiplicity = 'one' | 'many';

export type ComplexTypeKind = 'enum' | 'entity';

export interface INamed {
  name: string;
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

export interface AsHash<T> {
  [name: string]: T;
}
