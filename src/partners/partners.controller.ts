import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Query,
    ParseBoolPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './DTO/partner.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
    constructor(private readonly partnersService: PartnersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() createPartnerDto: CreatePartnerDto) {
        return this.partnersService.create(createPartnerDto);
    }

    @Get()
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    findAll(@Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly?: boolean) {
        return this.partnersService.findAll(activeOnly ?? false);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.partnersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePartnerDto: UpdatePartnerDto,
    ) {
        return this.partnersService.update(id, updatePartnerDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.partnersService.remove(id);
    }
}
