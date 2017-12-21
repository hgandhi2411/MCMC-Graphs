/* eslint linebreak-style: ["error", "windows"] */
'use strict';

// Var prompt = require('readline');
// NetworkX to my rescue!!
var jsnx = require('jsnetworkx');
var hash = require('object-hash');

var r = 1.0;
var temperature = 298.0;
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

// Doesn't work yet
function initialGraph(graph) {
  // Makes the initial graph from the number of nodes and coordinates.
  // We start off with a completely centralized network.
  var G = new jsnx.Graph();
  G.addNode(0, { Coord: graph.nodeCoord[0] });
  for (let e = 0; e < graph.nodes - 1; e++) {
    graph.connect(e, e + 1);
    G.addNode(e, { Coord: graph.nodeCoord[e] });
    const w = distance(graph.nodeCoord[e], graph.nodeCoord[e + 1]);
    G.addWeightedEdgesFrom([[e, e + 1, w]]);
  }
  return [graph, G];
}

function stateGoodness(graph) {
  let nodes = graph.nodes();
  // Let edges = graph.edges();
  let weights = Array.from(jsnx.getEdgeAttributes(graph, 'weight').values());
  let weightAllEdges = 0;
  for (let i = 0; i < weights.length; i++) {
    weightAllEdges += weights[i];
  }
  let sumAllShortestPaths = 0;
  for (let j = 1; j < nodes.length; j++) {
    sumAllShortestPaths += jsnx.dijkstraPathLength(graph, { source: 0, target: j });
    // Unclear whether we need all paths from 0 to k or just the shortest path. So I take the shortest path here.
  }
  let theta = r * weightAllEdges + sumAllShortestPaths;
  return theta;
}
function addEdge(G) {
  let nodes = G.nodes();
  let edges = G.edges();
  let a = Math.floor(Math.random() * (nodes.length - 1));
  let b = Math.floor(Math.random() * (nodes.length - 1));
  // Check if a = b
  if (a === b) {
    return addEdge(G);
  }
  // Check through the edge list if the edge(a,b) already exists
  for (let e = 0; e < edges.length; e++) {
    let x = edges[e];
    if (x[0] === a || x[1] === a) {
      if (x[0] === b || x[1] === b) {
        return addEdge(G);
      }
    }
  }
  // Add edge if it doesn't exist
  G.addWeightedEdgesFrom([[a, b, distance(G.node.get(a).Coord, G.node.get(b).Coord)]]);
  return G;
}

function bridgeEdges(graph) {
  let tempGraph = graph;
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
  let a = Math.floor(Math.random() * (nodes.length - 1));
  let b = Math.floor(Math.random() * (nodes.length - 1));
  // Check if a = b
  if (a === b) {
    return deleteEdge(graph);
  }
  // Find bridges
  // Check if edge(a,b) is a bridge edge
  let bridges = bridgeEdges(graph);
  for (let e = 0; e < edges.length; e++) {
    let x = bridges[e];
    // Check if edge already exists
    if (x[0] === a || x[1] === a) {
      if (x[0] === b || x[1] === b) {
        return deleteEdge(graph);
      }
    }
  }
  graph.removeEdge([a, b]);
  return graph;
}

function proposal(graph) {
  let nodes = graph.nodes();
  let edges = graph.edges();
  let add = false;
  if (edges.length <= nodes.length - 1) {
    add = true;
  }
  if (edges.length >= nodes.length * (nodes.length - 1) / 2.0) {
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
function hashCount(graph) {
  let h = hash(graph);
  for (let key in countDict) {
    if (key === h) {
      countDict[key] += 1;
      return;
    }
  }
  countDict[hash] = 1;
}

var newGraph = new Graph(10);
newGraph.nodeCoords(0, 2, 4);
newGraph.nodeCoords(1, 4, 6);
newGraph.nodeCoords(2, 5, 7);
newGraph.nodeCoords(3, 8, 7);
newGraph.nodeCoords(4, 2, 6);
newGraph.nodeCoords(5, 2, 0);
newGraph.nodeCoords(6, 2, 5);
newGraph.nodeCoords(7, 1, 3);
newGraph.nodeCoords(8, 9, 6);
newGraph.nodeCoords(9, 10, 6);

var initial = initialGraph(newGraph);
newGraph = initial[0];
var G = initial[1];
// Let path = jsnx.allPairsDijkstraPath(G);
// Console.log(G.node.get(2).Coord);
// Console.log(Array.from(jsnx.getEdgeAttributes(G, 'weight').values()));
console.log(G.edges());
console.log(addEdge(G).edges());
console.log(deleteEdge(G).edges());

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
  hashCount
};
