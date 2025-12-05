import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class LinkController {
    constructor(private readonly linkService: LinkService) { }

    // Rota pública - listar links ativos
    @Get('links')
    findAllActive() {
        return this.linkService.findAllActive();
    }

    // Rotas admin - protegidas
    @UseGuards(JwtAuthGuard)
    @Get('admin/links')
    findAll() {
        return this.linkService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Patch('admin/links/reorder')
    updateOrder(@Body() updates: { id: number; order: number }[]) {
        return this.linkService.updateOrder(updates);
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/links')
    create(@Body() createLinkDto: CreateLinkDto) {
        return this.linkService.create(createLinkDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin/links/:id')
    findOne(@Param('id') id: string) {
        return this.linkService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('admin/links/:id')
    update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
        return this.linkService.update(+id, updateLinkDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('admin/links/:id')
    remove(@Param('id') id: string) {
        return this.linkService.remove(+id);
    }
}
