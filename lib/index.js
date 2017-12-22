/* eslint linebreak-style: ["error", "windows"] */
'use strict';

// Var prompt = require('readline');
// NetworkX to my rescue!!
var jsnx = require('jsnetworkx');
var hash = require('object-hash');
var commandLineArgs = require('command-line-args');
var quantile = require('compute-quantile');

function input() {
  // Takes commandline inputs
  const optionDefinitions = [
    {
      name: 'nodeNumber',
      alias: 'n',
      type: Number,
      defaultValue: 10
    },
    { name: 'rFactor', alias: 'r', type: Number, defaultValue: 1 },
    {
      name: 'temperature',
      alias: 't',
      type: Number,
      defaultValue: 1
    },
    {
      name: 'coordinates',
      alias: 'c',
      type: Array,
      defaultValue: [
        [0, 0],
        [1, 1],
        [2, 2],
        [-1, 2],
        [6, 7],
        [2, 0],
        [-5, 4],
        [9, 0],
        [0, -3],
        [0, 6]
      ]
    }
  ];

  const options = commandLineArgs(optionDefinitions);
  return options;
}

// Setting all inputs as global variables
const options = input();
var r = options.rFactor;
var temperature = options.temperature;
var nnodes = options.nodeNumber;
var coordinates = options.coordinates;
class Graph {
  // This class stores nodes, coordinates of nodes and edges
  constructor(nnodes) {
    this.nodes = nnodes;
    this.edges = Array(0);
    this.nodeCoord = Array(nnodes);
  }
  connect(start, end) {
    this.edges.push([start, end]);
  }
  nodeCoords(i, x, y) {
    this.nodeCoord[i] = [x, y];
  }
}

function connectedNodes(graph, i, j, visited = []) {
  // Here graph is a jsnx graph
  // This function checks if i and j are connected
  if (i === j) return true;
  for (let index = 0; index < graph.edges().length; index++) {
    const e = graph.edges()[index];
    if ((e[0] === i && e[1] === j) || (e[1] === i && e[0] === j)) return true;
  }
  for (let index = 0; index < graph.edges().length; index++) {
    const e = graph.edges()[index];
    if (
      e[0] === i &&
      !visited.reduce((pv, v) => {
        return pv || v === e[0];
      }, false) // Map Reduce, check every node and see if it has been visited before.
    ) {
      if (connectedNodes(graph, e[1], j, visited.concat([i]))) return true;
    }

    if (
      e[1] === i &&
      !visited.reduce((pv, v) => {
        return pv || v === e[0];
      }, false)
    ) {
      if (connectedNodes(graph, e[0], j, visited.concat([i]))) return true; // Concatenate will create a new array
    }
  }
  return false;
}

function connected(graph) {
  // Here graph is a jsnx graph
  // This function verifies if the graph is connected
  for (let i = 0; i < graph.nodes().length; i++) {
    for (let j = i + 1; j < graph.nodes().length; j++) {
      if (!connectedNodes(graph, i, j)) {
        // Console.log(`nodes ${i} and ${j} are disconnected`);
        return false;
      }
    }
  }
  return true;
}

function distance(coord1, coord2) {
  // Calculate the Euclidian distance between nodes, i.e., the length of edges.
  // Euclidian distance is also going to be the weight of edges.
  let dist = Math.sqrt(
    Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2)
  );
  return dist;
}

function initialGraph(graph) {
  // Makes the initial graph from the number of nodes and coordinates.
  // We start off with forming a cycle and connecting node 0 to all other nodes
  var G = new jsnx.Graph();
  G.addNode(0, { Coord: graph.nodeCoord[0] });
  for (let e = 0; e < graph.nodes; e++) {
    if (e < graph.nodes - 1) {
      graph.connect(0, e);
      graph.connect(e, e + 1);
      G.addNode(e, { Coord: graph.nodeCoord[e] });
      const w = distance(graph.nodeCoord[0], graph.nodeCoord[e]);
      G.addWeightedEdgesFrom([[0, e, w]]);
      const w1 = distance(graph.nodeCoord[e], graph.nodeCoord[e + 1]);
      G.addWeightedEdgesFrom([[e, e + 1, w1]]);
    } else {
      graph.connect(e, 0);
      G.addNode(e, { Coord: graph.nodeCoord[e] });
      const w = distance(graph.nodeCoord[e], graph.nodeCoord[0]);
      G.addWeightedEdgesFrom([[e, 0, w]]);
    }
  }
  G.removeEdge(0, 0);
  return [graph, G];
}

function stateGoodness(graph) {
  // Here graph is a jsnx graph
  let G = jsnx.toNetworkxGraph(graph);
  let nodes = G.nodes();
  // Let edges = G.edges();
  let weights = Array.from(jsnx.getEdgeAttributes(G, 'weight').values());
  let weightAllEdges = 0;
  for (let i = 0; i < weights.length; i++) {
    weightAllEdges += weights[i];
  }
  let sumAllShortestPaths = 0;
  for (let j = 1; j < nodes.length; j++) {
    sumAllShortestPaths += jsnx.dijkstraPathLength(G, { source: 0, target: j });
    // Unclear whether we need all paths from 0 to k or just the shortest path. So I take the shortest path here.
  }
  let theta = r * weightAllEdges + sumAllShortestPaths;
  return theta;
}

function addEdge(graph) {
  // Here graph is a jsnx graph
  // Let graph = jsnx.toNetworkxGraph(graph);
  let nodes = graph.nodes();
  let edges = graph.edges();
  let a = Math.floor(Math.random() * (nodes.length - 1));
  let b = Math.floor(Math.random() * (nodes.length - 1));
  // Check if a = b
  if (a === b) {
    return addEdge(graph);
  }
  let found = false;
  // Add edge if it doesn't exist
  for (let e = 0; e < edges.length; e++) {
    // Check if the edge exists
    let e1 = edges[e];
    if ((a === e1[0] && b === e1[1]) || (a === e1[1] && b === e1[0])) {
      found = true;
    }
  }
  if (!found) {
    graph.addWeightedEdgesFrom([
      [a, b, distance(graph.node.get(a).Coord, graph.node.get(b).Coord)]
    ]);
    return graph;
  }
  return addEdge(graph);
}

function bridgeEdges(graph) {
  // Here graph is a jsnx graph
  let tempGraph = jsnx.toNetworkxGraph(graph);
  let stillConnected = false;
  let bridges = [];
  for (let e = 0; e < tempGraph.edges().length; e++) {
    let edge = tempGraph.edges()[e];
    tempGraph.removeEdge(edge[0], edge[1]);
    stillConnected = connected(tempGraph);
    if (!stillConnected) {
      bridges.push([edge[0], edge[1]]);
    }
    tempGraph.addWeightedEdgesFrom([
      [
        edge[0],
        edge[1],
        distance(tempGraph.node.get(edge[0]), tempGraph.node.get(edge[1]))
      ]
    ]);
  }
  return bridges;
}

function deleteEdge(graph) {
  let nodes = graph.nodes();
  let edges = graph.edges();
  let a = Math.ceil(Math.random() * (nodes.length - 1));
  let b = Math.floor(Math.random() * (nodes.length - 1));
  // Check if a = b
  if (a === b) {
    return deleteEdge(graph);
  }
  let bridges = bridgeEdges(graph);
  let found = false;
  for (let e = 0; e < edges.length; e++) {
    // Check if the edge exists
    let e1 = edges[e];
    if ((a === e1[0] && b === e1[1]) || (a === e1[1] && b === e1[0])) {
      // If it exists check if it's a bridge
      for (let b = 0; b < bridges.length; b++) {
        let x = bridges[b];
        // Check if edge already exists
        if ((a === x[0] && b === x[1]) || (a === x[1] && b === x[0])) {
          return deleteEdge(graph);
        }
      }
      found = true;
      break;
    }
  }
  let stillConnected = false;
  if (found) {
    graph.removeEdge(a, b);
    stillConnected = connected(graph);
    if (stillConnected) {
      return graph;
    }
    graph.addEdge(a, b, distance(graph.node.get(a).Coord, graph.node.get(b).Coord));
    return deleteEdge(graph);
  }
  return deleteEdge(graph);
}

function proposal(G) {
  // Here graph is a jsnx graph
  let graph = jsnx.toNetworkxGraph(G);
  let nodes = graph.nodes();
  let edges = graph.edges();
  let add = true;
  let p = Math.random();
  // Uniform probability of adding and deleting
  if (p > 0.5 || edges.length >= nodes.length * (nodes.length - 1) / 2.0) {
    add = false;
  }
  let newGraph;
  if (add) {
    newGraph = addEdge(graph);
  } else {
    newGraph = deleteEdge(graph);
  }
  // Metropolis Hastings algorithm
  let thetai = stateGoodness(graph);
  let thetaj = stateGoodness(newGraph);
  let probability = Math.min(Math.exp(-(thetaj - thetai) / temperature), 1);
  let qij = Math.random();
  if (probability > qij) {
    return newGraph;
  }
  return graph;
}

var countDict = {};
var hashList = {};
function hashCount(graph) {
  let h = hash(graph);
  hashList[hash] = graph;
  let found = false;
  for (let key in countDict) {
    if (key === h) {
      found = true;
      break;
    }
  }
  if (found) {
    countDict[h] += 1;
    return countDict;
  }
  countDict[h] = 1;
  return countDict;
}

function mcmc() {
  let iterations = 100;
  let graph = new Graph(nnodes);
  for (let node = 0; node < nnodes; node++) {
    let x = coordinates[node];
    graph.nodeCoords(node, x[0], x[1]);
  }
  let oldGraph = initialGraph(graph)[1];
  hashCount(graph);
  for (let i = 0; i < iterations; i++) {
    console.log(i);
    let newGraph = proposal(oldGraph);
    hashCount(newGraph);
    oldGraph = newGraph;
  }

  let top10 = quantile(countDict, 0.1);
  return top10;
}

// var top10 = mcmc();
// console.log(top10);

module.exports = {
  Graph,
  connected,
  distance,
  initialGraph,
  stateGoodness,
  addEdge,
  bridgeEdges,
  deleteEdge,
  proposal,
  hashCount,
  mcmc
};
