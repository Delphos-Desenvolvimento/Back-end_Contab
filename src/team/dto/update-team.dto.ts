import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTeamDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
