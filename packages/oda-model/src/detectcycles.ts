import { INamed } from './types';

export class GraphSimple<T extends INamed> {
  public readonly vertices: Map<string, Vertex<T>>;
  public readonly field: keyof T;
  constructor(items: T[], field: keyof T) {
    this.vertices = new Map(
      items.map(i => [i.name, new Vertex(i)] as [string, Vertex<T>]),
    );
    this.field = field;
    this.build();
  }
  public hasCycle(): boolean {
    return hasCycle(this.vertices, this.field);
  }
  public build() {
    for (let v of this.vertices.values()) {
      for (let ed of (v.item[this.field] as unknown) as Iterable<string>) {
        let neighbor = this.vertices.get(ed);
        if (neighbor) {
          v.up.set(neighbor.name, neighbor);
          neighbor.down.set(v.name, v);
        }
      }
    }
  }
  public getSubGraphs() {
    return [...this.vertices.values()].filter(v => v.up.size === 0);
  }
}

export class Vertex<T extends INamed> {
  public readonly item: T;
  public readonly name: string;
  public readonly up: Map<string, Vertex<T>>;
  public readonly down: Map<string, Vertex<T>>;
  constructor(item: T) {
    this.item = item;
    this.name = item.name;
    this.up = new Map();
    this.down = new Map();
  }
}

export function hasCycle<T extends INamed>(
  input: (T | Vertex<T>)[] | Map<string, Vertex<T>>,
  field: keyof T,
) {
  const gray = new Map<string, Vertex<T>>();
  const black = new Map<string, Vertex<T>>();

  const white =
    input instanceof Map
      ? new Map(input)
      : new Map(
          input.map(
            i =>
              [i.name, i instanceof Vertex ? i : new Vertex(i)] as [
                string,
                Vertex<T>
              ],
          ),
        );
  while (white.size > 0) {
    for (let v of white.values()) {
      if (deepFirstSearch_<T>(v, white, gray, black, field)) {
        return true;
      }
    }
  }
  return false;
}

function deepFirstSearch_<T extends INamed>(
  current: Vertex<T> | undefined,
  white: Map<string, Vertex<T>>,
  gray: Map<string, Vertex<T>>,
  black: Map<string, Vertex<T>>,
  key: keyof T,
): boolean {
  if (current) {
    white.delete(current.name);
    gray.set(current.name, current);
    for (let edge of (current.item[key] as unknown) as Iterable<string>) {
      if (black.has(edge)) {
        continue;
      }
      if (gray.has(edge)) {
        return true;
      }
      if (
        white.has(edge) &&
        deepFirstSearch_(white.get(edge), white, gray, black, key)
      ) {
        return true;
      }
    }
    gray.delete(current.name);
    black.set(current.name, current);
    return false;
  } else {
    return false;
  }
}
