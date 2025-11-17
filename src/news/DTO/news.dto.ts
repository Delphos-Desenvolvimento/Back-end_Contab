import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum NewsStatus {
  DRAFT = 'rascunho',
  PUBLISHED = 'publicado',
  ARCHIVED = 'arquivado'
}

export class CreateNewsDto {
  @ApiProperty({ description: 'Title of the news article', example: 'Breaking News' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Content of the news article', 
    example: 'This is the content of the news article...' 
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    description: 'Category of the news article', 
    example: 'politics' 
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ 
    description: 'URL of the main image (optional)',
    required: false,
    example: 'https://example.com/image.jpg'
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ 
    description: 'Status of the news article',
    enum: NewsStatus,
    default: NewsStatus.DRAFT
  })
  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;

  @ApiProperty({
    description: 'Array of image files',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @ApiProperty({ 
    description: 'Array of image files to upload',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];

  @ApiProperty({ 
    description: 'Array of image IDs to delete',
    type: [Number],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.map(Number))
  imagesToDelete?: number[];
}

export class DeleteNewsDto {
  @ApiProperty({ 
    description: 'Array of news IDs to delete',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.map(Number))
  ids: number[];

  @ApiProperty({ 
    description: 'Whether to delete associated images from storage',
    default: true,
    required: false
  })
  @IsOptional()
  deleteImages?: boolean;
}

// Response DTOs
export class NewsResponseDto {
  @ApiProperty({ description: 'News ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'News title', example: 'Breaking News' })
  title: string;

  @ApiProperty({ description: 'News content', example: 'Content here...' })
  content: string;

  @ApiProperty({ description: 'News category', example: 'politics' })
  category: string;

  @ApiProperty({ 
    description: 'News status', 
    enum: NewsStatus,
    example: NewsStatus.DRAFT
  })
  status: NewsStatus;

  @ApiProperty({ 
    description: 'News images',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        url: { type: 'string', example: 'https://example.com/image.jpg' },
        altText: { type: 'string', example: 'Image description' }
      }
    }
  })
  images: Array<{
    id: number;
    url: string;
    altText?: string;
  }>;

  @ApiProperty({ description: 'View count', example: 0 })
  views: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}