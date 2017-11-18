'use strict';

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
  for (let index = 0; index < graph.edges.length; index++) {
    const e = graph.edges[index];
    if ((e[0] === i && e[1] === j) || (e[1] === i && e[0] === j)) return true;
  }
  for (let index = 0; index < graph.edges.length; index++) {
    const e = graph.edges[index];
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
  for (let i = 0; i < graph.nodes; i++) {
    for (let j = i + 1; j < graph.nodes; j++) {
      if (!connectedNodes(graph, i, j)) {
        // Console.log(`nodes ${i} and ${j} are disconnected`);
        return false;
      }
    }
  }
  return true;
}

function distance(graph) {
  // Calculate the Euclidian distance between nodes, i.e., the length of edges.
  // Euclidian distance is also going to be the weight of edges
  let dist = Array(graph.edges.length);
  for (let i = 0; i < graph.edges.length; i++) {
    const e = graph.edges[i];
    const a = graph.nodeCoord[e[0]];
    const b = graph.nodeCoord[e[1]];
    const x1 = a[0];
    const y1 = a[1];
    const x2 = b[0];
    const y2 = b[1];
    dist[i] = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }
  return dist;
}

/* Just testing!
let newGraph = new Graph(4);
newGraph.connect(0, 1);
newGraph.connect(0, 3);
newGraph.connect(2, 3);
newGraph.nodeCoords(0, 2, 4);
newGraph.nodeCoords(1, 4, 6);
newGraph.nodeCoords(2, 5, 7);
newGraph.nodeCoords(3, 8, 7);
console.log(connected(newGraph));
console.log(distance(newGraph));
*/
module.exports = { Graph, connected, distance };
