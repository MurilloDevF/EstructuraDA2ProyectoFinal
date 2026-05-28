import { MinHeap } from './Heap.js';

export class Graph {
  constructor() {
    this.adjacencyList = {};
    this.coordinates = {}; // Maps vertex name -> { lat, lng }
  }

  addVertex(vertex, coords = null) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
    if (coords) {
      this.coordinates[vertex] = coords;
    }
  }

  addEdge(vertex1, vertex2, weight) {
    if (!this.adjacencyList[vertex1]) this.addVertex(vertex1);
    if (!this.adjacencyList[vertex2]) this.addVertex(vertex2);

    // Undirected edge
    if (!this.adjacencyList[vertex1].some(edge => edge.node === vertex2)) {
      this.adjacencyList[vertex1].push({ node: vertex2, weight });
    }
    if (!this.adjacencyList[vertex2].some(edge => edge.node === vertex1)) {
      this.adjacencyList[vertex2].push({ node: vertex1, weight });
    }
  }

  // Dijkstra's Shortest Path algorithm using the custom MinHeap
  getShortestPath(startVertex, endVertex) {
    if (!this.adjacencyList[startVertex] || !this.adjacencyList[endVertex]) {
      return { path: [], distance: Infinity };
    }

    const distances = {};
    const previous = {};
    const priorityQueue = new MinHeap();

    // Initialize distances
    for (const vertex in this.adjacencyList) {
      if (vertex === startVertex) {
        distances[vertex] = 0;
        priorityQueue.insert(vertex, 0);
      } else {
        distances[vertex] = Infinity;
      }
      previous[vertex] = null;
    }

    while (!priorityQueue.isEmpty()) {
      const smallest = priorityQueue.extractMin();

      if (smallest === endVertex) {
        const path = [];
        let current = endVertex;
        while (current) {
          path.push(current);
          current = previous[current];
        }
        return {
          path: path.reverse(),
          distance: distances[endVertex]
        };
      }

      if (!smallest || distances[smallest] === Infinity) {
        break;
      }

      const neighbors = this.adjacencyList[smallest] || [];
      for (const neighbor of neighbors) {
        const nextNode = neighbor.node;
        const candidateDistance = distances[smallest] + neighbor.weight;

        if (candidateDistance < distances[nextNode]) {
          distances[nextNode] = candidateDistance;
          previous[nextNode] = smallest;
          priorityQueue.insert(nextNode, candidateDistance);
        }
      }
    }

    return { path: [], distance: Infinity };
  }

  getCoordinates(vertex) {
    return this.coordinates[vertex] || null;
  }
}
