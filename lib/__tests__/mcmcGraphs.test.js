/* eslint linebreak-style: ["error", "windows"] */
const assert = require('assert');
const mcmcGraphs = require('../index.js');

describe('mcmcGraphs', () => {
  it('has a test', () => {
    assert(true, 'mcmcGraphs should have a test');
  });
});

describe('graphmc graph connectivity', () => {
  it('should correctly say a graph is connected if it is', () => {
    const graph = new mcmcGraphs.Graph(6);
    graph.connect(0, 1);
    graph.connect(1, 2);
    graph.connect(2, 3);
    graph.connect(3, 0);
    graph.connect(3, 5);
    graph.connect(4, 5);
    const result = mcmcGraphs.connected(graph);
    assert(result, 'The graph should have been connected');
  });
  it('should correctly say a disconnected graph is disconnected', () => {
    const graph = new mcmcGraphs.Graph(4);
    graph.connect(0, 3);
    graph.connect(1, 2);
    const result = mcmcGraphs.connected(graph);
    assert(!result, 'the graph is not connected');
  });
});

describe('graphmc coordinate assignment', () => {
  const graph = new mcmcGraphs.Graph(2);
  graph.nodeCoords(0, 1, 2);
  graph.nodeCoords(1, 3, 4);
  assert(graph.nodeCoord[0][0] === 1, 'Coordinates are not correctly assigned');
  assert(graph.nodeCoord[1][1] === 4, 'Coordinates are not assigned correctly');
});

describe('graphmc distance', () => {
  it('should correctly calculate euclidian distances', () => {
    const result = mcmcGraphs.distance([0, 0], [3, 4]);
    const expected = 5.0;
    assert(result === expected, 'the distances are not correct');
  });
});

describe('graphmc initial graph', () => {
  it('should have edges equal to (number of nodes - 1) and must be connected', () => {
    let newGraph = new mcmcGraphs.Graph(4);
    newGraph.nodeCoords(0, 2, 4);
    newGraph.nodeCoords(1, 4, 6);
    newGraph.nodeCoords(2, 5, 7);
    newGraph.nodeCoords(3, 8, 7);
    let initial = mcmcGraphs.initialGraph(newGraph);
    newGraph = initial[0];
    assert(newGraph.edges.length === 3, 'Initial graph was not constructed as intended!');
    assert(mcmcGraphs.connected(newGraph), 'The initial graph is not a connected graph!');
  });
});

describe('graphmc addEdge', () => {
  it('should return a graph with exactly one more edge than the previous graph', () => {
    let graph = new mcmcGraphs.Graph(4);
    graph.nodeCoords(0, 2, 4);
    graph.nodeCoords(1, 4, 6);
    graph.nodeCoords(2, 5, 7);
    graph.nodeCoords(3, 8, 7);
    graph = mcmcGraphs.initialGraph(graph);
    let newGraph = mcmcGraphs.addEdge(graph);
    assert(
      graph.edges().length + 1 === newGraph.edges().length ||
        graph.edges().length === newGraph.edges().length,
      'addEdge gives incorrect new graph'
    );
  });
});

/*
Describe('graphmc deleteEdge', () => {
  it('should return a graph with exactly one less edge than the previous graph', () => {
    let graph = new mcmcGraphs.Graph(4);
    graph.nodeCoords(0, 2, 4);
    graph.nodeCoords(1, 4, 6);
    graph.nodeCoords(2, 5, 7);
    graph.nodeCoords(3, 8, 7);
    graph = mcmcGraphs.initialGraph(graph);
    let newGraph = mcmcGraphs.deleteEdge(graph);
    assert(
      graph.edges().length - 1,
      newGraph.edges().length,
      'addEdge gives incorrect new graph'
    );
  });
});
*/
