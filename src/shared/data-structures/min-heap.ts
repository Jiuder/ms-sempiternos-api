export class MinHeap<T> {
  private readonly heap: T[] = [];

  constructor(private readonly compareFn: (a: T, b: T) => number) {}

  public get size(): number {
    return this.heap.length;
  }

  public peek(): T | undefined {
    return this.heap[0];
  }

  public push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  public toSortedArray(): T[] {
    const result: T[] = [];
    const backup: T[] = [];
    while (this.heap.length > 0) {
      const item = this.pop()!;
      result.push(item);
      backup.push(item);
    }
    backup.forEach((item) => this.push(item));
    return result;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compareFn(this.heap[index], this.heap[parent]) >= 0) break;
      this.swap(index, parent);
      index = parent;
    }
  }

  private getSwapIndex(index: number, element: T, length: number): number | null {
    const leftChildIdx = 2 * index + 1;
    const rightChildIdx = 2 * index + 2;
    let swapIdx: number | null = null;

    if (leftChildIdx < length && this.compareFn(this.heap[leftChildIdx], element) < 0) {
      swapIdx = leftChildIdx;
    }

    if (rightChildIdx < length) {
      const compareTo = swapIdx === null ? element : this.heap[leftChildIdx];
      if (this.compareFn(this.heap[rightChildIdx], compareTo) < 0) {
        swapIdx = rightChildIdx;
      }
    }

    return swapIdx;
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const swapIdx = this.getSwapIndex(index, element, length);
      if (swapIdx === null) break;

      this.heap[index] = this.heap[swapIdx];
      this.heap[swapIdx] = element;
      index = swapIdx;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
