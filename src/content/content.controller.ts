import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { AuditService } from '../audit/audit.service';
import type { Request as ExpressRequest } from 'express';
import { UpdateAboutDto } from './dto/update-about.dto';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { UpdateSolutionDto } from './dto/update-solution.dto';
import { ReorderDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly auditService: AuditService,
  ) {}

  // About Section - Public
  @Get('about')
  getAboutSection() {
    return this.contentService.getAboutSection();
  }

  // About Section - Admin
  @Put('about')
  @UseGuards(JwtAuthGuard)
  updateAboutSection(
    @Body() updateAboutDto: UpdateAboutDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService
      .updateAboutSection(updateAboutDto)
      .then(async (res) => {
        await this.auditService.log({
          type: 'about_update',
          userId,
          path,
          ip,
        });
        return res;
      });
  }

  // Statistics - Public
  @Get('statistics')
  getAllStatistics() {
    return this.contentService.getAllStatistics();
  }

  // Statistics - Admin
  @Get('statistics/admin')
  @UseGuards(JwtAuthGuard)
  getAllStatisticsAdmin() {
    return this.contentService.getAllStatisticsAdmin();
  }

  @Get('statistics/:id')
  @UseGuards(JwtAuthGuard)
  getStatisticById(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.getStatisticById(id);
  }

  @Post('statistics')
  @UseGuards(JwtAuthGuard)
  createStatistic(
    @Body() createStatisticDto: CreateStatisticDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService
      .createStatistic(createStatisticDto)
      .then(async (stat) => {
        await this.auditService.log({
          type: 'statistics_create',
          userId,
          path,
          ip,
        });
        return stat;
      });
  }

  @Put('statistics/:id')
  @UseGuards(JwtAuthGuard)
  updateStatistic(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatisticDto: UpdateStatisticDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService
      .updateStatistic(id, updateStatisticDto)
      .then(async (stat) => {
        await this.auditService.log({
          type: 'statistics_update',
          userId,
          path,
          ip,
        });
        return stat;
      });
  }

  @Delete('statistics/:id')
  @UseGuards(JwtAuthGuard)
  deleteStatistic(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService.deleteStatistic(id).then(async (res) => {
      await this.auditService.log({
        type: 'statistics_delete',
        userId,
        path,
        ip,
      });
      return res;
    });
  }

  @Patch('statistics/reorder')
  @UseGuards(JwtAuthGuard)
  reorderStatistics(@Body() reorderDto: ReorderDto) {
    return this.contentService.reorderStatistics(reorderDto.items);
  }

  // Solutions - Public
  @Get('solutions')
  getAllSolutions() {
    return this.contentService.getAllSolutions();
  }

  // Solutions - Admin
  @Get('solutions/admin')
  @UseGuards(JwtAuthGuard)
  getAllSolutionsAdmin() {
    return this.contentService.getAllSolutionsAdmin();
  }

  @Get('solutions/:id')
  @UseGuards(JwtAuthGuard)
  getSolutionById(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.getSolutionById(id);
  }

  @Post('solutions')
  @UseGuards(JwtAuthGuard)
  createSolution(
    @Body() createSolutionDto: CreateSolutionDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService
      .createSolution(createSolutionDto)
      .then(async (sol) => {
        await this.auditService.log({
          type: 'solutions_create',
          userId,
          path,
          ip,
        });
        return sol;
      });
  }

  @Put('solutions/:id')
  @UseGuards(JwtAuthGuard)
  updateSolution(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSolutionDto: UpdateSolutionDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService
      .updateSolution(id, updateSolutionDto)
      .then(async (sol) => {
        await this.auditService.log({
          type: 'solutions_update',
          userId,
          path,
          ip,
        });
        return sol;
      });
  }

  @Delete('solutions/:id')
  @UseGuards(JwtAuthGuard)
  deleteSolution(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService.deleteSolution(id).then(async (res) => {
      await this.auditService.log({
        type: 'solutions_delete',
        userId,
        path,
        ip,
      });
      return res;
    });
  }

  @Patch('solutions/reorder')
  @UseGuards(JwtAuthGuard)
  reorderSolutions(@Body() reorderDto: ReorderDto, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;
    return this.contentService
      .reorderSolutions(reorderDto.items)
      .then(async (res) => {
        await this.auditService.log({
          type: 'solutions_reorder',
          userId,
          path,
          ip,
        });
        return res;
      });
  }
}
