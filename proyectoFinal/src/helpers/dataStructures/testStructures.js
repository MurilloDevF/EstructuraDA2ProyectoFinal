import { Stack } from './Stack.js';
import { Queue } from './Queue.js';
import { Trie } from './Trie.js';
import { MinHeap } from './Heap.js';
import { Graph } from './Graph.js';

function runTests() {
  console.log('=== Running Custom Data Structure Tests ===\n');

  // 1. STACK TEST
  console.log('--- Testing Stack (Pila) ---');
  const stack = new Stack();
  stack.push('home');
  stack.push('products');
  stack.push('cart');
  console.assert(stack.size() === 3, 'Stack size should be 3');
  console.assert(stack.peek() === 'cart', 'Stack peek should be cart');
  console.assert(stack.pop() === 'cart', 'Stack pop should be cart');
  console.assert(stack.peek() === 'products', 'Stack peek should be products');
  console.assert(stack.size() === 2, 'Stack size should be 2');
  console.log('Stack tests passed!\n');

  // 2. QUEUE TEST
  console.log('--- Testing Queue (Cola) ---');
  const queue = new Queue();
  queue.enqueue('order1');
  queue.enqueue('order2');
  console.assert(queue.size() === 2, 'Queue size should be 2');
  console.assert(queue.peek() === 'order1', 'Queue peek should be order1');
  console.assert(queue.dequeue() === 'order1', 'Queue dequeue should be order1');
  console.assert(queue.peek() === 'order2', 'Queue peek should be order2');
  console.assert(queue.size() === 1, 'Queue size should be 1');
  console.log('Queue tests passed!\n');

  // 3. TRIE TEST
  console.log('--- Testing Trie (Search Autocomplete) ---');
  const trie = new Trie();
  const p1 = { id: 1, name: 'Apple iPhone' };
  const p2 = { id: 2, name: 'Apple iPad' };
  const p3 = { id: 3, name: 'Samsung Galaxy' };
  const p4 = { id: 4, name: 'Apples' };

  trie.insert('Apple', p1);
  trie.insert('iPhone', p1);
  trie.insert('Apple', p2);
  trie.insert('iPad', p2);
  trie.insert('Samsung', p3);
  trie.insert('Galaxy', p3);
  trie.insert('Apples', p4);

  const appleResults = trie.search('app');
  console.assert(appleResults.length === 3, `Expected 3 results for "app", got ${appleResults.length}`);
  console.assert(appleResults.some(p => p.id === 1), 'Should contain p1');
  console.assert(appleResults.some(p => p.id === 2), 'Should contain p2');
  console.assert(appleResults.some(p => p.id === 4), 'Should contain p4');

  const samsungResults = trie.search('sam');
  console.assert(samsungResults.length === 1, 'Expected 1 result for "sam"');
  console.assert(samsungResults[0].id === 3, 'Result should be p3');

  const emptyResults = trie.search('xyz');
  console.assert(emptyResults.length === 0, 'Expected 0 results for "xyz"');
  console.log('Trie tests passed!\n');

  // 4. HEAP TEST
  console.log('--- Testing Min-Heap (Priority Queue) ---');
  const heap = new MinHeap();
  heap.insert('Order A', 10);
  heap.insert('Order B', 5);
  heap.insert('Order C', 15);
  heap.insert('Order D', 1);

  console.assert(heap.size() === 4, 'Heap size should be 4');
  console.assert(heap.peek() === 'Order D', 'Min heap peek should be Order D');
  console.assert(heap.extractMin() === 'Order D', 'First extracted should be D');
  console.assert(heap.extractMin() === 'Order B', 'Second extracted should be B');
  console.assert(heap.extractMin() === 'Order A', 'Third extracted should be A');
  console.assert(heap.extractMin() === 'Order C', 'Fourth extracted should be C');
  console.assert(heap.isEmpty() === true, 'Heap should be empty');
  console.log('Heap tests passed!\n');

  // 5. GRAPH TEST
  console.log('--- Testing Graph (Dijkstra Route Planning) ---');
  const graph = new Graph();
  // Nodes representation
  graph.addVertex('Store');
  graph.addVertex('Intersection_A');
  graph.addVertex('Intersection_B');
  graph.addVertex('Client_1');
  graph.addVertex('Client_2');

  // Edges with weights
  graph.addEdge('Store', 'Intersection_A', 2);
  graph.addEdge('Intersection_A', 'Intersection_B', 3);
  graph.addEdge('Store', 'Intersection_B', 6);
  graph.addEdge('Intersection_B', 'Client_1', 1);
  graph.addEdge('Client_1', 'Client_2', 4);
  graph.addEdge('Intersection_A', 'Client_1', 8);

  const route = graph.getShortestPath('Store', 'Client_2');
  // Store -> Intersection_A (2) -> Intersection_B (3) -> Client_1 (1) -> Client_2 (4) = 10
  console.assert(route.distance === 10, `Shortest path distance should be 10, got ${route.distance}`);
  console.assert(JSON.stringify(route.path) === JSON.stringify(['Store', 'Intersection_A', 'Intersection_B', 'Client_1', 'Client_2']), 'Route path is incorrect');
  console.log('Graph Dijkstra tests passed!\n');

  console.log('All tests completed successfully!');
}

runTests();
