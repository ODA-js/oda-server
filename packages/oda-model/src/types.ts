import { readFileSync, writeFileSync } from 'fs';
import { IUpdatableBase } from './element';
import { merge, get, set, has, mergeWith } from 'lodash';

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
  field?: keyof S | keyof S & keyof I | string;
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
export function assignValue<S extends object, I extends object, V = any>(
  options: assignInput<S, I, V>,
) {
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
  if (has(input, inputField)) {
    // update value
    if (get(input, inputField) != null) {
      if (effect) {
        if (
          (allowEffect && allowEffect(src, get(input, inputField) as any)) ||
          !allowEffect
        ) {
          effect(src, get(input, inputField) as any);
        } else if (
          allowEffect &&
          !allowEffect(src, get(input, inputField) as any) &&
          setDefault instanceof Function
        ) {
          setDefault(src);
        }
      } else if (field) {
        set(src, field, get(input, inputField));
      }
    } else if (inputField && get(input, inputField) === null && required) {
      if (setDefault instanceof Function) {
        setDefault(src);
      } else if (field) {
        throw new Error("can't reset required value");
      }
    } else if (inputField && get(input, inputField) === null) {
      if (setDefault instanceof Function) {
        setDefault(src);
      } else if (field) {
        set(src, field, undefined);
      }
    }
  } else {
    // set default value
    if (field && get(src, field) == null) {
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
  | 'args'
  | 'model-hook'
  | RelationType;

export type Multiplicity = 'one' | 'many';
/**
 * kind of complex type
 */
export type ComplexTypeKind = 'enum' | 'entity';

export type OperationKind =
  | 'create'
  | 'readOne'
  | 'realMany'
  | 'update'
  | 'delete';

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

export interface IFieldArgsForHash {
  type?: string;
  required?: boolean;
  defaultValue?: string;
  multiplicity?: Multiplicity;
}

export interface IFieldArgs extends INamed, IFieldArgsForHash {}
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
  multiplicity?: Multiplicity;
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
  multiplicity?: Multiplicity;
};

export type FieldType = string | EnumType | EntityType;

export interface AsHash<T extends Partial<INamed> & object> {
  [name: string]: T;
}

export type NamedArray<T extends INamed> = Array<T>;

function mergeDupes<O extends Partial<INamed> & object>(
  src: Map<string, O>,
  items: [string, O][],
  killDupes?: (obj: O, src: O) => void,
) {
  items.forEach(item => {
    if (killDupes) {
      const dupe = src.get(item[0]);
      if (dupe) {
        killDupes(dupe, item[1]);
      } else {
        src.set(item[0], item[1]);
      }
    } else {
      src.set(item[0], item[1]);
    }
  });
}

export function ArrayToMap<T extends INamed, O extends INamed = T>(
  input: NamedArray<T>,
  process?: (v: T) => O,
  killDupes?: (obj: O, src: O) => void,
) {
  const res = new Map<string, O>();
  mergeDupes(
    res,
    input.map(f => {
      let result: O = (f as unknown) as O;
      if (process) {
        result = (process(f) as unknown) as O;
      }
      return [result.name, result] as [string, O];
    }),
    killDupes,
  );
  return res;
}

export function HashToMap<
  T extends Partial<INamed> & object,
  O extends Partial<INamed> & object = T
>(
  input: AsHash<T>,
  process?: (name: string, v: T) => O,
  killDupes?: (obj: O, src: O) => void,
): Map<string, O> {
  const res = new Map<string, O>();
  mergeDupes(
    res,
    Object.keys(input).map(key => {
      let result: O | T = (input[key] as unknown) as O;
      if (process) {
        result = process(key, (result as unknown) as T);
      } else {
        result = {
          name: key,
          ...result,
        };
      }
      return [result.name, result] as [string, O];
    }),
    killDupes,
  );
  return res;
}

export function HashToArray<T extends Partial<INamed> & object>(
  input: AsHash<T>,
  process?: (name: string, v: T) => T,
  killDupes?: (obj: T, src: T) => void,
): T[] {
  const res = new Map<string, T>();
  mergeDupes(
    res,
    Object.keys(input).map(key => {
      let result = input[key];
      if (process) {
        result = process(key, result);
      } else {
        result = {
          ...result,
          name: key,
        };
      }
      return [result.name, result] as [string, T];
    }),
    killDupes,
  );
  return [...res.values()];
}

export function ArrayToHash<T extends INamed>(
  input: Array<T>,
  process?: (v: T) => T,
  killDupes?: (obj: T, src: T) => void,
): AsHash<T> {
  const res = new Map<string, T>();
  mergeDupes(
    res,
    input.map(f => {
      let result: T = (f as unknown) as T;
      if (process) {
        result = (process(f) as unknown) as T;
      }
      return [result.name, result] as [string, T];
    }),
    killDupes,
  );
  return [...res.values()].reduce(
    (result, item) => {
      result[item.name] = item;
      return result;
    },
    {} as AsHash<T>,
  );
}

export function MapToHash<T extends INamed, O extends INamed = T>(
  input: Map<string, T>,
  process?: (name: string, v: T) => O,
): AsHash<O> {
  return [...input.entries()].reduce(
    (hash, [name, value]) => {
      hash[name] = process
        ? (process(name, value) as O)
        : ((value as unknown) as O);
      return hash;
    },
    {} as AsHash<O>,
  );
}

export function MapToArray<T extends INamed, O extends INamed = T>(
  input: Map<string, T>,
  process?: (name: string, v: T) => O,
): NamedArray<O> {
  return [...input.entries()].reduce(
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

export type Merger<I extends INamed> = (
  objValue: any,
  srcValue: any,
  key: keyof I,
  object: I,
  source: I,
  stack: string[],
) => any;

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
>(src: T, create: new (input: I) => N, prop: keyof T, merger?: Merger<I>) {
  return (value: V) => {
    let result: N | undefined;
    const srcMap = (get(src, prop) as unknown) as Map<string, N> | undefined;
    if (typeof value === 'string') {
      result = srcMap && srcMap.get(value as string);
    } else {
      const name = (value as I).name;
      const original = srcMap && srcMap.get(name);
      if (original) {
        let update: any;
        if (merger) {
          update = mergeWith({}, original.toObject(), value, merger);
        } else {
          update = merge({}, original.toObject(), value);
        }
        original.updateWith(update);
      } else {
        srcMap && srcMap.set(name, new create(value as I));
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
