export class MinHeap {
  constructor() {
    this.heap = [];
  }

  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  swap(i1, i2) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  // Inserts an element with a priority rank (smaller priority is processed first)
  insert(element, priority) {
    const item = { element, priority };
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  heapifyUp(index) {
    let current = index;
    while (
      current > 0 &&
      this.heap[current].priority < this.heap[this.getParentIndex(current)].priority
    ) {
      const parent = this.getParentIndex(current);
      this.swap(current, parent);
      current = parent;
    }
  }

  // Removes and returns the element with lowest priority value
  extractMin() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop().element;

    const min = this.heap[0].element;
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  heapifyDown(index) {
    let current = index;
    const length = this.heap.length;

    while (this.getLeftChildIndex(current) < length) {
      let smallerChild = this.getLeftChildIndex(current);
      const rightChild = this.getRightChildIndex(current);

      if (
        rightChild < length &&
        this.heap[rightChild].priority < this.heap[smallerChild].priority
      ) {
        smallerChild = rightChild;
      }

      if (this.heap[current].priority <= this.heap[smallerChild].priority) {
        break;
      }

      this.swap(current, smallerChild);
      current = smallerChild;
    }
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.heap[0].element;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  clear() {
    this.heap = [];
  }

  // Helper method to get sorted copy of items for visual list rendering
  toArray() {
    const tempHeap = new MinHeap();
    tempHeap.heap = this.heap.map(item => ({ ...item }));
    const result = [];
    while (!tempHeap.isEmpty()) {
      result.push(tempHeap.extractMin());
    }
    return result;
  }
}
