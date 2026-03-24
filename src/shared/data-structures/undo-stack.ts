import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilterStateDto } from '@filter-history/dto/filter-history.dto';

@Injectable()
export class UndoStack {
  private readonly stack: FilterStateDto[] = [];
  private readonly maxSize: number;

  constructor(private readonly configService: ConfigService) {
    this.maxSize = this.configService.getOrThrow<number>('config.logStream.filterHistoryMax');
  }

  public push(state: FilterStateDto): void {
    if (this.stack.length >= this.maxSize) {
      this.stack.shift();
    }
    this.stack.push(state);
  }

  public pop(): FilterStateDto | undefined {
    return this.stack.pop();
  }

  public peek(): FilterStateDto | undefined {
    return this.stack[this.stack.length - 1];
  }

  public get size(): number {
    return this.stack.length;
  }

  public getAll(): FilterStateDto[] {
    return [...this.stack].reverse();
  }

  public hydrate(states: FilterStateDto[]): void {
    this.stack.length = 0;
    this.stack.push(...states.slice(-this.maxSize));
  }

  public snapshot(): FilterStateDto[] {
    return [...this.stack];
  }
}
