import { INamed } from './types';
import { merge } from 'lodash';

export class Graph<T extends INamed, P = any> {
  /** all vertices in named map */
  public readonly vertices: Map<string, Vertex<T>>;
  /** all edges */
  public readonly edges: Set<Edge<T, P>>;
  /** field which contains links between source items */
  public readonly field: keyof T;
  constructor(items: T[], field: keyof T) {
    /** load all items into vertices */
    this.vertices = new Map(
      items.map(i => [i.name, new Vertex(i)] as [string, Vertex<T>]),
    );
    this.field = field;
    /** create empty edges set */
    this.edges = new Set<Edge<T, P>>();
    /** build graph */
    this.build();
  }
  /** check if graph have cycles */
  public hasCycle(): boolean {
    return hasCycle(this);
  }
  /** build graph */
  public build() {
    /** remove edges */
    this.edges.clear();
    /** through all vertices */
    for (let source of this.vertices.values()) {
      /** get links for items */
      for (let dstName of (source.node[this.field] as unknown) as Iterable<
        string
      >) {
        /** if we have any Vertex in vertices with such name */
        let dest = this.vertices.get(dstName);
        if (dest) {
          /** create edge */
          const edge = new Edge<T>(source, dest);
          /** put it to graph edges */
          this.edges.add(edge);
          /** put it to source Vertex */
          source.edges.add(edge);
          /** put it to des Vertex */
          dest.edges.add(edge);
        }
      }
    }
  }
}

/** Vertex for graph model */
export class Vertex<T extends INamed, P = any> {
  /** stored node */
  public readonly node: T;
  /** name of item */
  public readonly name: string;
  /** owned edges list */
  public readonly edges: Set<Edge<T, P>>;
  constructor(node: T) {
    this.node = node;
    this.name = node.name;
    this.edges = new Set<Edge<T, P>>();
  }
}

/** Edge for Graph model */
export class Edge<T extends INamed, P = any> {
  /** source Vertex */
  public readonly source: Vertex<T>;
  /** dest Vertex */
  public readonly dest: Vertex<T>;
  /** if edge has payload we will store it as well */
  public payload?: P;
  constructor(source: Vertex<T>, dest: Vertex<T>, payload?: P) {
    this.source = source;
    this.dest = dest;
    this.payload = payload;
  }
}

export function hasCycle<T extends INamed, P = any>(graph: Graph<T, P>) {
  /** currently inspecting nodes */
  const gray = new Set<Vertex<T>>();
  /** already inspected nodes */
  const black = new Set<Vertex<T>>();
  /** do we have cycles */
  let cycles = false;
  deepFirstSearch<T>({
    graph,
    options: {
      order: 'forward',
      enter: ({ current }) => {
        gray.add(current);
      },
      leave: ({ current }) => {
        gray.delete(current);
        black.add(current);
      },
      allow: (args: TraverseOptionsActionsArgs<T, P>) => {
        let result = !cycles;
        if (result) {
          if (black.has(args.current)) {
            result = false;
          }
          if (gray.has(args.current)) {
            cycles = true;
            result = false;
          }
        }
        return result;
      },
    },
  });
  if (cycles) {
    return true;
  }
  return false;
}
/** option for traverse triggers */
export type TraverseOptionsActionsArgs<T extends INamed, P = any> = {
  /** current vertex */
  current: Vertex<T>;
  /** previous vertex */
  previous?: Vertex<T>;
  /** payload for edge */
  payload?: P;
};
/** search type: unordered forward backward */
export type SearchType = 'forward' | 'backward';

interface TraverseOptions<T extends INamed, P = any> {
  /** traverse order */
  order?: SearchType;
  /** payload */
  payload?: P;
  /** enter trigger */
  enter?: (args: TraverseOptionsActionsArgs<T, P>) => void;
  /** leave trigger */
  leave?: (args: TraverseOptionsActionsArgs<T, P>) => void;
  /** if it is allowed to run search */
  allow?: (args: TraverseOptionsActionsArgs<T, P>) => boolean;
}
/** common allow check */
function commonAllow<T extends INamed, P>() {
  /** already seen vertices */
  const seen = new Set<Vertex<T, P>>();
  return ({ current }: TraverseOptionsActionsArgs<T, P>) => {
    /** if we already seen this vertex */
    if (!seen.has(current)) {
      /** no! ok will see */
      seen.add(current);
      return true;
    }
    /** prohibit to see */
    return false;
  };
}
/** initial args for deep first search */
export type DFSArgs<T extends INamed, P> = {
  /** inspected graph */
  graph: Graph<T>;
  /** from which vertex to start */
  start?: Vertex<T>;
  /** traverse options */
  options?: TraverseOptions<T, P>;
};

/** deep first search */
function deepFirstSearch<T extends INamed, P = any>({
  graph,
  options = {},
}: DFSArgs<T, P>) {
  /** do we have any vertices in graph */
  if (graph.vertices.size > 0) {
    options = merge(
      {
        /** use default allow if haven't any */
        allow:
          options && options.allow instanceof Function
            ? undefined
            : commonAllow(),
        /** set default order to unordered */
        order: 'forward',
      } as TraverseOptions<T, P>,
      options,
    ) as TraverseOptions<T, P>;

    graph.vertices.forEach(current => {
      if (options.allow && options.allow({ current })) {
        /** run recursively DFS */
        deepFirstSearchRecursive<T, P>({
          graph,
          current,
          options,
        } as DFSRecursiveArgs<T, P>);
      }
    });
  }
}

/** recursive DFS arguments */
export type DFSRecursiveArgs<T extends INamed, P = any> = {
  /** graph */
  graph: Graph<T, P>;
  /** current vertex */
  current: Vertex<T, P>;
  /** previous vertex */
  previous: Vertex<T, P> | undefined;
  /** option for specific run */
  options: TraverseOptions<T, P>;
};

function deepFirstSearchRecursive<T extends INamed, P = any>({
  graph,
  current,
  previous,
  options,
}: DFSRecursiveArgs<T, P>) {
  const { payload, enter, allow, leave, order } = options;
  /** fire `enter` trigger */
  enter && enter({ current, previous, payload });
  /** run over all edges for current Vertex */
  current.edges.forEach(edge => {
    if (
      (order === 'forward' && edge.source !== current) ||
      (order === 'backward' && edge.dest !== current)
    ) {
      return;
    }
    /** if we have ordered search */
    /**  get right vertex from current edge*/
    const next = order === 'forward' ? edge.dest : edge.source;
    /** check if we allow to proceed search */
    if (
      allow instanceof Function &&
      allow({ current: next, previous: current, payload })
    ) {
      /** go deep */
      deepFirstSearchRecursive({
        graph,
        current: next,
        previous: current,
        /** pass any payload we have */
        options: merge({}, options, { payload: edge.payload }),
      });
    }
  });
  /** fire `leave` trigger */
  leave && leave({ current, previous, payload });
}
