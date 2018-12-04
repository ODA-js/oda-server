export type Nullable<T> = { [P in keyof T]: T[P] | undefined | null };

/**
 *
 */
export type assignInput<I, T, K = any> = {
  /**
   * source object
   */
  src: I;
  /**
   * dest object
   */
  input: Nullable<T>;
  /**
   * field from source object which is assigned
   */
  field?: keyof I | keyof I & keyof T;
  /**
   * function that will call to assign value
   */
  effect?: (src: I, value: K) => void;
  /**
   * function that check if effect is allowed
   */
  allowEffect?: (src: I, value: K) => boolean;
  /**
   * is field required, so it can't be reset by set null.
   * in this case assign will throw
   */
  required?: boolean;
  /**
   * field from dest object which value will be assigned to dest field
   */
  inputField?: keyof T;
  /**
   * function that will call to set default value
   */
  setDefault?: (src: I) => void;
};

/**
 * check specified value from input and assign
 * @param options assign Options
 */
export function assignValue<I, T, K = any>(options: assignInput<I, T, K>) {
  let {
    src,
    input,
    field,
    effect,
    required,
    inputField,
    setDefault,
    allowEffect,
  } = options;

  if (!inputField) {
    inputField = field as keyof T;
  }
  if (input.hasOwnProperty(inputField)) {
    if (input[inputField] != null) {
      if (effect) {
        if (
          (allowEffect && allowEffect(src, input[inputField] as any)) ||
          !allowEffect
        ) {
          effect(src, input[inputField] as any);
        }
      } else if (field) {
        src[field] = input[inputField] as any;
      }
    } else if (field && src[field] == null && required) {
      throw new Error("can't reset required value");
    } else if (field && src[field] === null) {
      if (setDefault instanceof Function) {
        setDefault(src);
      } else {
        delete src[field];
      }
    }
  } else {
    if (field && required && src[field] == null) {
      if (setDefault instanceof Function) {
        setDefault(src);
      }
    }
  }
}

export type RelationType = 'HasMany' | 'HasOne' | 'BelongsToMany' | 'BelongsTo';

export type MetaModelType =
  | 'element'
  | 'metadata'
  | 'model'
  | 'query'
  | 'mutation'
  | 'package'
  | 'entity-base'
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

export function HashToArray<T extends INamed>(input: AsHash<T>): T[] {
  return Object.values(input);
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
