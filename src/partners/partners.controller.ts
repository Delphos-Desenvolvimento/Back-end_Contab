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
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PartnersService } from './partners.service';
import { AuditService } from '../audit/audit.service';
import type { Request as ExpressRequest } from 'express';
import { CreatePartnerDto, UpdatePartnerDto } from './DTO/partner.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createPartnerDto: CreatePartnerDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.partnersService
      .create(createPartnerDto)
      .then(async (partner) => {
        await this.auditService.log({
          type: 'partner_create',
          userId,
          path,
          ip,
        });
        return partner;
      });
  }

  @Get()
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(
    @Query('activeOnly', new ParseBoolPipe({ optional: true }))
    activeOnly?: boolean,
  ) {
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
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.partnersService
      .update(id, updatePartnerDto)
      .then(async (partner) => {
        await this.auditService.log({
          type: 'partner_update',
          userId,
          path,
          ip,
        });
        return partner;
      });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.partnersService.remove(id).then(async (res) => {
      await this.auditService.log({
        type: 'partner_delete',
        userId,
        path,
        ip,
      });
      return res;
    });
  }
}
