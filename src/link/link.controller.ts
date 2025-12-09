import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { AuditService } from '../audit/audit.service';
import type { Request as ExpressRequest } from 'express';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly auditService: AuditService,
  ) {}

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
  updateOrder(
    @Body() updates: { id: number; order: number }[],
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.linkService.updateOrder(updates).then(async (res) => {
      await this.auditService.log({ type: 'links_reorder', userId, path, ip });
      return res;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/links')
  create(@Body() createLinkDto: CreateLinkDto, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.linkService.create(createLinkDto).then(async (link) => {
      await this.auditService.log({ type: 'links_create', userId, path, ip });
      return link;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/links/:id')
  findOne(@Param('id') id: string) {
    return this.linkService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/links/:id')
  update(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.linkService.update(+id, updateLinkDto).then(async (link) => {
      await this.auditService.log({ type: 'links_update', userId, path, ip });
      return link;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/links/:id')
  remove(@Param('id') id: string, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.linkService.remove(+id).then(async (res) => {
      await this.auditService.log({ type: 'links_delete', userId, path, ip });
      return res;
    });
  }
}
