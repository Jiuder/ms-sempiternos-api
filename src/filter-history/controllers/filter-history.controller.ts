import { Controller, Post, Delete, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { FilterHistoryService } from '@filter-history/services/filter-history.service';
import { FilterHistoryResponseDto, PushFilterDto } from '@filter-history/dto/filter-history.dto';

@ApiTags('⏳ Filter History')
@Controller('filter-history')
export class FilterHistoryController {
  constructor(private readonly filterHistoryService: FilterHistoryService) {}

  @Post('push')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a new filter state to the undo stack' })
  @ApiCreatedResponse({
    description: 'Filter successfully saved to the stack',
    type: FilterHistoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid filter configuration provided' })
  public push(@Body() dto: PushFilterDto): Promise<FilterHistoryResponseDto> {
    return this.filterHistoryService.push(dto);
  }

  @Delete('undo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Undo the last filter (pop from stack)' })
  @ApiOkResponse({
    description: 'Successfully removed the most recent filter',
    type: FilterHistoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Stack is empty, nothing to undo' })
  public undo(): Promise<FilterHistoryResponseDto> {
    return this.filterHistoryService.undo();
  }

  @Get('current')
  @ApiOperation({ summary: 'Peek at the current filter without modifying the stack' })
  @ApiOkResponse({
    description: 'Returns the currently active filter, or null if stack is empty',
    type: FilterHistoryResponseDto,
  })
  public getCurrent(): FilterHistoryResponseDto {
    return this.filterHistoryService.getCurrent();
  }
}
