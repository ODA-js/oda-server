import 'jest';
import { hasCycle, Graph } from '../utils/detectcyclesedges';

describe('Graph', () => {
  it('detects', () => {
    const input = [
      {
        name: 'a',
        implements: ['e'],
      },
      {
        name: 'b',
        implements: ['a'],
      },
      {
        name: 'c',
        implements: ['3'],
      },
      {
        name: 'd',
        implements: ['a'],
      },
      {
        name: 'e',
        implements: ['a', 'b'],
      },
    ];
    const g = new Graph(input, 'implements');

    expect(hasCycle(g)).toBeTruthy();
  });
  it('not detects', () => {
    const input = [
      {
        name: 'a',
        implements: [],
      },
      {
        name: 'b',
        implements: ['a'],
      },
      {
        name: 'c',
        implements: ['3'],
      },
      {
        name: 'd',
        implements: ['a'],
      },
      {
        name: 'e',
        implements: ['a', 'b'],
      },
    ];
    const g = new Graph(input, 'implements');
    expect(g.vertices.size).toBe(5);
    expect(g.edges.size).toBe(4);
    expect(hasCycle(g)).toBeFalsy();
  });
  it('build Graph', () => {
    const input = [
      {
        name: 'a',
        implements: ['e'],
      },
      {
        name: 'b',
        implements: ['a'],
      },
      {
        name: 'c',
        implements: ['3'],
      },
      {
        name: 'd',
        implements: ['a'],
      },
      {
        name: 'e',
        implements: ['a', 'b'],
      },
    ];
    const graph = new Graph(input, 'implements');
    expect(
      [...graph.edges].map(e => `${e.source.name}-> ${e.dest.name}`),
    ).toMatchSnapshot('graph');
    expect(graph.hasCycle()).toBeTruthy();
    expect(
      [...graph.edges].map(e => `${e.source.name}-> ${e.dest.name}`),
    ).toMatchSnapshot('graph-final');
  });

  it('get SubGraph', () => {
    const input = [
      {
        name: 'a',
        implements: [],
      },
      {
        name: 'b',
        implements: [],
      },
      {
        name: 'c',
        implements: [],
      },
      {
        name: 'd',
        implements: ['a'],
      },
      {
        name: 'e',
        implements: ['a', 'b'],
      },
      {
        name: 'f',
        implements: ['b'],
      },
      {
        name: 'g',
        implements: ['b'],
      },
      {
        name: 'h',
        implements: ['c'],
      },
      {
        name: 'i',
        implements: ['e'],
      },
      {
        name: 'j',
        implements: ['g', 'h'],
      },
    ];
    const graph = new Graph(input, 'implements');
    expect(
      [...graph.edges].map(e => `${e.source.name}-> ${e.dest.name}`),
    ).toMatchSnapshot('graph');
    expect(graph.hasCycle()).toBeFalsy();
    expect(
      [...graph.edges].map(e => `${e.source.name}-> ${e.dest.name}`),
    ).toMatchSnapshot('graph-final');
    debugger;
    const sub = graph.getIsolatedSubGraphs();
    expect(sub.length).toBe(3);
    expect(sub.map(vl => [...vl.vertices.keys()])).toMatchSnapshot('sub-final');
  });
});
