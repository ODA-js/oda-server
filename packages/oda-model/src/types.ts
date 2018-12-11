import { readFileSync, writeFileSync } from 'fs';
import { IUpdatableBase } from './element';
import { merge } from 'lodash';

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
  | 'package-base'
  | 'model'
  | 'package'
  | 'entity'
  | 'mixin'
  | 'query'
  | 'mutation'
  | 'scalar'
  | 'union'
  | 'directive'
  | 'enum'
  | 'enum-item'
  | 'entity-base'
  | 'field-base'
  | 'simple-field'
  | 'enum-field'
  | 'entity-field'
  | 'relation-field'
  | 'relation'
  | 'relation-base'
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

export interface AsHash<T extends Partial<INamed> & object> {
  [name: string]: T;
}

export type NamedArray<T extends INamed> = Array<T>;

export function ArrayToMap<T extends INamed>(input: NamedArray<T>) {
  return new Map<string, T>(input.map(f => [f.name, f] as [string, T]));
}

export function HashToMap<T extends Partial<INamed> & object>(
  input: AsHash<T>,
): Map<string, T> {
  const res = Object.keys(input).map(name => {
    return [name, { name, ...input[name] } as T] as [string, T];
  });
  return new Map(res);
}

export function HashToArray<T extends Partial<INamed> & object>(
  input: AsHash<T>,
): T[] {
  return Object.keys(input).map(key => {
    return { ...input[key], name: key } as T;
  });
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

export function MapToHash<T extends INamed, O extends INamed = T>(
  input: Map<string, T>,
  process?: (v: T) => Partial<O> & object,
): AsHash<O> {
  return [...input.entries()].reduce(
    (hash, [name, value]) => {
      hash[name] = process ? (process(value) as O) : ((value as unknown) as O);
      return hash;
    },
    {} as AsHash<O>,
  );
}

export function MapToArray<T extends INamed, O extends INamed = T>(
  input: Map<string, T>,
  process?: (name: string, v: T) => O,
): NamedArray<O> {
  return [...input].reduce(
    (r, curr) => {
      r.push(
        process
          ? (process(curr[0], curr[1]) as O)
          : ((curr[1] as unknown) as O),
      );
      return r;
    },
    [] as O[],
  );
}
/**
 * create items with lookup from source
 * @param src source for lookup data
 * @param create constructor to create items
 * @param prop source prop name where lookup is located
 */
export function createOrMergeFromMap<
  T,
  N extends INamed & IUpdatableBase,
  I extends INamed,
  V extends string | I
>(src: T, create: new (input: I) => N, prop: keyof T) {
  return (value: V) => {
    let result: N | undefined;
    const srcMap = (src[prop] as unknown) as Map<string, N>;
    if (typeof value === 'string') {
      result = srcMap.get(value as string);
    } else {
      const name = (value as I).name;
      const original = srcMap.get(name);
      if (original) {
        const update = merge({}, original.toObject(), value);
        original.updateWith(update);
      } else {
        srcMap.set(name, new create(value as I));
      }
      result = new create(value as I);
    }
    return result ? ([result.name, result] as [string, N]) : undefined;
  };
}

export function loadFromFile<T, I>(
  filename: string,
  create: new (inp: I) => T,
) {
  const txt = readFileSync(filename);
  return new create(JSON.parse(txt.toString()) as I);
}

export function saveToFile<T extends { toObject: () => any }>(
  filename: string,
  inp: T,
) {
  writeFileSync(filename, inp.toObject());
}
