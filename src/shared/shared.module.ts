import { Module } from '@nestjs/common';
import { SlidingWindowSet } from '@shared/data-structures/sliding-window-set';

@Module({
  providers: [SlidingWindowSet],
  exports: [SlidingWindowSet],
})
export class SharedModule {}
