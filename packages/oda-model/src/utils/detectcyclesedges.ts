import { INamed } from '../types';
import { merge } from 'lodash';

export type BuilderGraphFunction<T extends INamed, P = any> = (
  graph: Graph<T, P>,
  source: Vertex<T, P>,
) => void;

export class Graph<T extends INamed, P = any> {
  /** all vertices in named map */
  public readonly vertices: Map<string, Vertex<T>>;
  /** all edges */
  public readonly edges: Set<Edge<T, P>>;
  /** field which contains links between source items */
  public readonly field: keyof T;
  public readonly builder: BuilderGraphFunction<T, P> = (
    graph: Graph<T, P>,
    source: Vertex<T, P>,
  ) => {
    /** get links for items */
    for (let dstName of (source.node[graph.field] as unknown) as Iterable<
      string
    >) {
      /** if we have any Vertex in vertices with such name */
      let dest = this.vertices.get(dstName);
      if (dest) {
        /** create edge */
        const edge = new Edge<T>(source, dest);
        /** put it to graph edges */
        graph.edges.add(edge);
        /** put it to source Vertex */
        source.edges.add(edge);
        /** put it to des Vertex */
        dest.edges.add(edge);
      }
    }
  };

  constructor(
    items: T[],
    field: keyof T,
    builder?: BuilderGraphFunction<T, P>,
  ) {
    /** load all items into vertices */
    this.vertices = new Map(
      items.map(i => [i.name, new Vertex(i)] as [string, Vertex<T>]),
    );
    this.field = field;
    /** create empty edges set */
    this.edges = new Set<Edge<T, P>>();
    if (builder) {
      this.builder = builder;
    }
    /** build graph */
    this.build();
  }
  /** check if graph have cycles */
  public hasCycle(): boolean {
    return hasCycle(this);
  }

  public getIsolatedSubGraphs(): Graph<T, P>[] {
    return getSubGraphs(this).map(
      v => new Graph<T, P>([...v.values()].map(v => v.node), this.field),
    );
  }

  public getSubGraphs(): Graph<T, P>[] {
    return getSubGraphs(this).map(vs => {
      const result = new Graph<T, P>([], this.field);
      vs.forEach(v => {
        v.edges.forEach(e => {
          if (vs.has(e.source) && vs.has(e.dest)) {
            result.edges.add(e);
          }
        });
        result.vertices.set(v.name, v);
      });
      return result;
    });
  }

  toObject(): T[] {
    return [...this.vertices.values()].map(v => v.node);
  }

  /** build graph */
  public build() {
    /** remove edges */
    this.edges.clear();
    /** through all vertices */
    for (let source of this.vertices.values()) {
      this.builder(this, source);
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

export type GetSubGraphsContext<T extends INamed, P> = {
  existing: Set<Vertex<T, P>>;
};
export function getSubGraphs<T extends INamed, P = any>(
  graph: Graph<T, P>,
): Set<Vertex<T, P>>[] {
  /** find vertices which has no outgoing connection connection, */
  const all = new Set([...graph.vertices.values()]);
  graph.edges.forEach(e => {
    if (all.has(e.source)) {
      all.delete(e.source);
    }
  });
  let result:
    | Map<Vertex<T, P>, GetSubGraphsContext<T, P>>
    | undefined = deepFirstSearch<T, P, GetSubGraphsContext<T, P>>({
    graph,
    options: {
      /** init context */
      start: (_start: Vertex<T, P>) => {
        return { existing: new Set<Vertex<T, P>>() };
      },
      finish: _context => {
        /** we can make result here */
        debugger;
      },
      startsWith: all,
      /** in which order do we traversing */
      order: 'backward',
      /** what to do when we enters to Vertex */
      enter: ({ current, context }) => {
        /** add vertex to gray bucket */
        if (context && !context.existing.has(current))
          context.existing.add(current);
      },
      allow: ({ current, context }) => {
        return (context && !context.existing.has(current)) || !context;
      },
    },
  });
  if (result) {
    return [...result.values()].map(r => r.existing);
  } else {
    return [] as Set<Vertex<T, P>>[];
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
      /** in which order do we traversing */
      order: 'forward',
      /** what to do when we enters to Vertex */
      enter: ({ current }) => {
        /** add vertex to gray bucket */
        gray.add(current);
      },
      /** what to do when we leave the vertex */
      leave: ({ current }) => {
        /** remove vertex from gray bucket */
        gray.delete(current);
        /** add to black bucket */
        black.add(current);
      },
      /** check if we allowed to enter this edge */
      allow: (args: TraverseOptionsActionsArgs<T, P>) => {
        /** we have no cycles */
        let result = !cycles;
        if (result) {
          /** we already test this vertex */
          if (black.has(args.current)) {
            result = false;
          }
          /** we currently testing this vertex */
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
export type TraverseOptionsActionsArgs<T extends INamed, P = any, C = any> = {
  /** current vertex */
  current: Vertex<T>;
  /** previous vertex */
  previous?: Vertex<T>;
  /** payload for edge */
  payload?: P;
  /** context */
  context?: C;
};
/** search type: unordered forward backward */
export type SearchType = 'forward' | 'backward';

interface TraverseOptions<T extends INamed, P = any, C = any> {
  /** initialize context if need */
  start?: (start: Vertex<T, P>) => C;
  finish?: (context?: C) => void;
  context?: C;
  /** traverse order */
  order?: SearchType;
  /** payload */
  payload?: P;
  /** initial vertices */
  startsWith?: Set<Vertex<T, P>>;
  /** enter trigger */
  enter?: (args: TraverseOptionsActionsArgs<T, P, C>) => void;
  /** leave trigger */
  leave?: (args: TraverseOptionsActionsArgs<T, P, C>) => void;
  /** if it is allowed to run search */
  allow?: (args: TraverseOptionsActionsArgs<T, P, C>) => boolean;
}
/** common allow check */
function commonAllow<T extends INamed, P, C>() {
  /** already seen vertices */
  const seen = new Set<Vertex<T, P>>();
  return ({ current }: TraverseOptionsActionsArgs<T, P, C>) => {
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
export type DFSArgs<T extends INamed, P, C> = {
  /** inspected graph */
  graph: Graph<T>;
  /** from which vertex to start */
  start?: Vertex<T>;
  /** traverse options */
  options?: TraverseOptions<T, P, C>;
};

/** deep first search */
function deepFirstSearch<T extends INamed, P = any, C = any>({
  graph,
  options = {},
}: DFSArgs<T, P, C>): Map<Vertex<T, P>, C> | undefined {
  if (!options.startsWith) {
    options.startsWith = new Set();
  }

  if (options.startsWith.size === 0) {
    graph.vertices.forEach(
      v => options.startsWith && options.startsWith.add(v),
    );
  }
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
      } as TraverseOptions<T, P, C>,
      options,
    ) as TraverseOptions<T, P, C>;
    // context for each node in loop
    const contexts = new Map<Vertex<T, P>, C>();
    /** this is not actually graph, so we need to examine all nodes */
    options.startsWith &&
      options.startsWith.forEach(current => {
        if (options.start) {
          contexts.set(current, options.start(current));
        }
        if (
          options.allow &&
          options.allow({ current, context: contexts.get(current) })
        ) {
          /** init context */
          /** run recursively DFS */
          deepFirstSearchRecursive<T, P, C>({
            graph,
            current,
            options: {
              ...options,
              context: contexts.get(current),
            },
          } as DFSRecursiveArgs<T, P, C>);
          /** check if we have any context init and we have finish entry in options */
          if (options.start && options.finish && contexts.has(current)) {
            /** only here we call finish */
            options.finish(contexts.get(current));
          }
        }
      });
    return contexts;
  }
  return;
}

/** recursive DFS arguments */
export type DFSRecursiveArgs<T extends INamed, P = any, C = any> = {
  /** graph */
  graph: Graph<T, P>;
  /** current vertex */
  current: Vertex<T, P>;
  /** previous vertex */
  previous: Vertex<T, P> | undefined;
  /** option for specific run */
  options: TraverseOptions<T, P, C>;
};

function deepFirstSearchRecursive<T extends INamed, P = any, C = any>({
  graph,
  current,
  previous,
  options,
}: DFSRecursiveArgs<T, P, C>) {
  const { payload, enter, allow, leave, order, context } = options;
  /** fire `enter` trigger */
  enter && enter({ current, previous, payload, context });
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
      allow({ current: next, previous: current, payload, context })
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
  leave && leave({ current, previous, payload, context });
}
