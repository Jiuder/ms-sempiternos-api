import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlidingWindowEntry } from '@shared/interfaces/sliding-window-entry.interface';

@Injectable()
export class SlidingWindowSet {
  private readonly idSet = new Set<string>();
  private readonly queue: SlidingWindowEntry[] = [];
  private windowMs: number;

  constructor(private readonly configService: ConfigService) {
    this.windowMs = this.configService.getOrThrow<number>('config.logStream.duplicateWindowMs');
  }

  public add(id: string, now: number = Date.now()): boolean {
    this.evictStale(now);
    const isDuplicate = this.idSet.has(id);
    if (!isDuplicate) {
      this.idSet.add(id);
      this.queue.push({ id, timestamp: now });
    }
    return isDuplicate;
  }

  public has(id: string): boolean {
    return this.idSet.has(id);
  }

  public get size(): number {
    return this.idSet.size;
  }

  public getWindowMs(): number {
    return this.windowMs;
  }

  public setWindowMs(ms: number): void {
    this.windowMs = ms;
  }

  public hydrate(entries: SlidingWindowEntry[]): void {
    const now = Date.now();
    for (const entry of entries) {
      if (now - entry.timestamp < this.windowMs) {
        this.idSet.add(entry.id);
        this.queue.push(entry);
      }
    }
  }

  public snapshot(): SlidingWindowEntry[] {
    return [...this.queue];
  }

  private evictStale(now: number): void {
    while (this.queue.length > 0 && now - this.queue[0].timestamp >= this.windowMs) {
      const evicted = this.queue.shift()!;
      this.idSet.delete(evicted.id);
    }
  }
}
