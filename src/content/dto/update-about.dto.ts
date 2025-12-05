import { IsString, IsOptional } from 'class-validator';

export class UpdateAboutDto {
    @IsOptional()
    @IsString()
    overline?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    solutionsOverline?: string;

    @IsOptional()
    @IsString()
    solutionsTitle?: string;

    @IsOptional()
    @IsString()
    solutionsSubtitle?: string;
}
