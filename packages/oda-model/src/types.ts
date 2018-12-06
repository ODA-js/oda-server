export type Nullable<T> = { [P in keyof T]: T[P] | undefined | null };

/**
 *
 */
export type assignInput<S, I, V = any> = {
  /**
   * source object
   */
  src: S;
  /**
   * dest object
   */
  input: Nullable<I>;
  /**
   * field from source object which is assigned
   */
  field?: keyof S | keyof S & keyof I;
  /**
   * function that will call to assign value
   */
  effect?: (src: S, value: V) => void;
  /**
   * function that check if effect is allowed
   */
  allowEffect?: (src: S, value: V) => boolean;
  /**
   * is field required, so it can't be reset by set null.
   * in this case assign will throw
   */
  required?: boolean;
  /**
   * field from dest object which value will be assigned to dest field
   */
  inputField?: keyof I;
  /**
   * function that will call to set default value
   */
  setDefault?: (src: S) => void;
};

/**
 * check specified value from input and assign
 * @param options assign Options
 */
export function assignValue<S, I, V = any>(options: assignInput<S, I, V>) {
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
    inputField = field as keyof I;
  }
  if (input.hasOwnProperty(inputField)) {
    // update value
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
    } else if (inputField && input[inputField] === null && required) {
      throw new Error("can't reset required value");
    } else if (inputField && input[inputField] === null) {
      if (setDefault instanceof Function) {
        setDefault(src);
      } else if (field) {
        delete src[field];
      }
    }
  } else {
    // set default value
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
   * complex type name
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

export type NamedArray<T extends INamed> = Array<T>;

export function ArrayToMap<T extends INamed>(input: NamedArray<T>) {
  return new Map<string, T>(input.map(f => [f.name, f] as [string, T]));
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

export function ArrayToHash<T extends INamed>(input: Array<T>): AsHash<T> {
  return input.reduce(
    (result, item) => {
      result[item.name] = item;
      return result;
    },
    {} as AsHash<T>,
  );
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

export function MapToArray<T extends INamed>(
  input: Map<string, T>,
): NamedArray<T> {
  return [...input.values()];
}

export function createFromMap<T, N extends INamed, I, V extends string | I>(
  src: T,
  create: new (input: I) => N,
  prop: keyof T,
) {
  return (value: V) => {
    let result: N | undefined;
    if (typeof value === 'string') {
      result = ((src[prop] as unknown) as Map<string, N>).get(value);
    } else {
      result = new create(value as I);
    }
    return result ? ([result.name, result] as [string, N]) : undefined;
  };
}
