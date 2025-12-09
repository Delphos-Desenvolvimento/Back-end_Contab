import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty({ description: 'Partner company name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Partner logo as base64 string' })
  @IsString()
  logoBase64: string;

  @ApiPropertyOptional({
    description: 'Display order (lower numbers appear first)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the partner is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePartnerDto {
  @ApiPropertyOptional({ description: 'Partner company name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Partner logo as base64 string' })
  @IsOptional()
  @IsString()
  logoBase64?: string;

  @ApiPropertyOptional({
    description: 'Display order (lower numbers appear first)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the partner is active' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
