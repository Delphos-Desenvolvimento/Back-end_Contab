import { IsString, IsUrl, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateLinkDto {
    @IsString()
    title: string;

    @IsUrl()
    url: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    imageBase64?: string;
}
