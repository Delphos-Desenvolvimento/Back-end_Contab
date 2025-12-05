import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
    id: number;
    order: number;
}

export class ReorderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItem)
    items: ReorderItem[];
}
