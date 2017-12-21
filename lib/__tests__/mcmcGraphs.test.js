/* eslint linebreak-style: ["error", "windows"] */
const assert = require('assert');
const jsnx = require('jsnetworkx');
const mcmcGraphs = require('../index.js');
const hash = require('object-hash');

describe('mcmcGraphs', () => {
  it('has a test', () => {
    assert(true, 'mcmcGraphs should have a test');
  });
});

describe('graphmc graph connectivity', () => {
  it('should correctly say a graph is connected if it is', () => {
    const graph = new jsnx.Graph();
    graph.addNodesFrom([0, 1, 2, 3]);
    graph.addWeightedEdgesFrom([[0, 1, 2], [0, 3, 1.7], [1, 2, 2.2], [1, 3, 1]]);
    const result = mcmcGraphs.connected(graph);
    assert(result, 'The graph should have been connected');
  });
  it('should correctly say a disconnected graph is disconnected', () => {
    const graph = new jsnx.Graph();
    graph.addNodesFrom([0, 1, 2, 3]);
    graph.addWeightedEdgesFrom([[1, 2, 2], [0, 3, 1]]);
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
  it('should have edges equal to (2 * number of nodes - 3) and must be connected', () => {
    let newGraph = new mcmcGraphs.Graph(4);
    newGraph.nodeCoords(0, 2, 4);
    newGraph.nodeCoords(1, 4, 6);
    newGraph.nodeCoords(2, 5, 7);
    newGraph.nodeCoords(3, 8, 7);
    let initial = mcmcGraphs.initialGraph(newGraph);
    newGraph = initial[1];
    assert(
      newGraph.edges().length === 2 * newGraph.nodes().length - 3,
      'Initial graph was not constructed as intended!'
    );
    assert(mcmcGraphs.connected(newGraph), 'The initial graph is not a connected graph!');
  });
});

describe('graphmc stateGoodness', () => {
  it('should give the correct theta function for a given graph', () => {
    let newGraph = new jsnx.Graph();
    newGraph.addNodesFrom([0, 1, 2, 3, 4]);
    newGraph.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 1], [1, 4, 2], [3, 2, 2]]);
    let goodness = mcmcGraphs.stateGoodness(newGraph);
    let r = 1.0;
    let theta = r * 6.0 + 8.0;
    assert(goodness === theta, 'theta calculation error!');
  });
});

describe('graphmc addEdge', () => {
  it('should return a graph with more or equal edges than the previous graph', () => {
    let graph = new jsnx.Graph();
    graph.addNode(0, { Coord: [0, 1] });
    graph.addNode(1, { Coord: [1, 1] });
    graph.addNode(2, { Coord: [2, 2] });
    graph.addNode(3, { Coord: [3, 3] });
    graph.addNode(4, { Coord: [4, 4] });
    graph.addNode(5, { Coord: [7, 8] });
    graph.addWeightedEdgesFrom([
      [0, 1, 1],
      [0, 2, 1],
      [1, 4, 2],
      [3, 2, 2],
      [2, 5, 1],
      [5, 4, 2]
    ]);
    let newGraph = mcmcGraphs.addEdge(graph);
    let y = newGraph.edges().length;
    assert(y === 7, 'addEdge gives incorrect new graph');
  });
});

describe('graphmc deleteEdge', () => {
  it('should return a graph with less or equal edges as the previous graph', () => {
    let graph = new jsnx.Graph();
    graph.addNode(0, { Coord: [0, 1] });
    graph.addNode(1, { Coord: [1, 1] });
    graph.addNode(2, { Coord: [2, 2] });
    graph.addNode(3, { Coord: [3, 3] });
    graph.addNode(4, { Coord: [4, 4] });
    graph.addNode(5, { Coord: [7, 8] });
    graph.addWeightedEdgesFrom([
      [0, 1, 1],
      [0, 2, 1],
      [1, 4, 2],
      [3, 2, 2],
      [2, 5, 1],
      [5, 4, 2],
      [3, 4, 1]
    ]);
    let newGraph = mcmcGraphs.deleteEdge(graph);
    let y = newGraph.edges().length;
    assert(y === 6, 'deleteEdge gives incorrect new graph');
  });
});

describe('graphmc hashCount function', () => {
  it("should hash graphs correctly and recognize if it's the same hash", () => {
    let graph = new jsnx.Graph();
    graph.addNode(0, { Coord: [0, 1] });
    graph.addNode(1, { Coord: [1, 1] });
    graph.addNode(2, { Coord: [2, 2] });
    graph.addNode(3, { Coord: [3, 3] });
    graph.addNode(4, { Coord: [4, 4] });
    graph.addNode(5, { Coord: [7, 8] });
    graph.addWeightedEdgesFrom([
      [0, 1, 1],
      [0, 2, 1],
      [1, 4, 2],
      [3, 2, 2],
      [2, 5, 1],
      [5, 4, 2],
      [3, 4, 1]
    ]);

    mcmcGraphs.hashCount(graph);
    let count = mcmcGraphs.hashCount(graph);
    console.log(count);
    let h = hash(graph);
    console.log(h);
    assert(count[h] === 2, 'hashing problem!');
  });
});
