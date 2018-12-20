import 'jest';
import { hasCycle, GraphSimple as Graph } from '../utils/detectcycles';

describe('cycles', () => {
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
    expect(hasCycle(input, 'implements')).toBeTruthy();
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
    expect(hasCycle(input, 'implements')).toBeFalsy();
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
    expect(graph).toMatchSnapshot('graph');
    expect(graph.hasCycle()).toBeTruthy();
    expect(graph).toMatchSnapshot('graph-final');
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
    expect(graph).toMatchSnapshot('graph');
    expect(graph.hasCycle()).toBeFalsy();
    expect(graph).toMatchSnapshot('graph-final');
    expect(graph.getSubGraphs().length).toBe(3);
  });
});
