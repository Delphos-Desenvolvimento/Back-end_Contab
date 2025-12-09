import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class EventsByDayQueryDto {
  @ApiProperty({ required: false, default: 'news_click' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, description: 'Number of days to include' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;

  @ApiProperty({
    required: false,
    description: 'Start date (inclusive) YYYY-MM-DD',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    required: false,
    description: 'End date (inclusive) YYYY-MM-DD',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
