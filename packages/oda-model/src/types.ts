import { readFileSync, writeFileSync } from 'fs';
import { IUpdatableBase } from './element';
import { get, set, has } from 'lodash';

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
  | 'readMany'
  | 'update'
  | 'delete'
  | 'addTo'
  | 'removeFrom';

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
  process?: (v: T, index: number) => O,
  killDupes?: (obj: O, src: O) => void,
) {
  const res = new Map<string, O>();
  mergeDupes(
    res,
    input.map((f, index) => {
      let result: O = (f as unknown) as O;
      if (process) {
        result = (process(f, index) as unknown) as O;
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
 * it checks and create item
 * @param srcMap external source map
 * @param create constructor for creating new item
 */
export function AssignAndKillDupes<
  T extends IUpdatableBase & INamed,
  I extends INamed
>(srcMap: Map<string, T> | undefined, create: new (input: I) => T) {
  return (i: I | string) => {
    let res: T | undefined;
    /** if item is string */
    if (typeof i === 'string') {
      /** check if we have one in external map */
      res = srcMap && srcMap.get(i);
      if (!res) {
        /** if not-> create it an push to external map */
        res = new create({ name: i } as any);
        srcMap && srcMap.set(res.name, res);
      }
    } else {
      /** if item is input object */
      res = new create(i);
      /** if we have the same in external map */
      const original = srcMap && srcMap.get(res.name);
      if (original) {
        /** if we have have then merge it with this one*/
        original.mergeWith(res.toObject());
      } else {
        /** set as original one */
        srcMap && srcMap.set(res.name, res);
      }
    }
    return res;
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
