import { IsString, IsNotEmpty, IsInt, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreateSolutionDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    icon: string;

    @IsString()
    @IsIn(['lucide', 'image'])
    iconType: 'lucide' | 'image';

    @IsInt()
    @IsOptional()
    order?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
